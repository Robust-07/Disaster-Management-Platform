const Resource = require('../models/Resource');
const ResourceRequest = require('../models/ResourceRequest');
const { scoreResourceMatch } = require('../utils/resourceMatching');

// @route  POST /api/resources
// @access Protected — ngo/authority only
module.exports.createResource = async (req, res) => {
  try {
    const { type, quantity, longitude, latitude, transportAvailable } = req.body;

    if (!type || quantity === undefined || longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        message: 'type, quantity, longitude and latitude are required',
      });
    }

    const resource = await Resource.create({
      providerId: req.user.id,
      type,
      quantity,
      transportAvailable: !!transportAvailable,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      },
    });

    res.status(201).json({ resource });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create resource', error: err.message });
  }
};

// @route  GET /api/resources/nearby?longitude=..&latitude=..&type=food&maxDistance=20000
// @access Protected
module.exports.getNearByResources = async (req, res) => {
  try {
    const { longitude, latitude, type, maxDistance } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'longitude and latitude query params are required' });
    }

    const query = {
      status: 'available',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
          $maxDistance: Number(maxDistance) || 20000,
        },
      },
    };
    if (type) query.type = type;

    const resources = await Resource.find(query);
    res.status(200).json({ count: resources.length, resources });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch nearby resources', error: err.message });
  }
};

// @route  GET /api/resources
// @access Protected
module.exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.status(200).json({ count: resources.length, resources });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resources', error: err.message });
  }
};

// @route  POST /api/resource-requests
// @access Protected — authority only
module.exports.createResourceRequest = async (req, res) => {
  try {
    const { campName, type, quantityNeeded, longitude, latitude, consumptionRatePerHour } = req.body;

    if (!campName || !type || quantityNeeded === undefined || longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        message: 'campName, type, quantityNeeded, longitude and latitude are required',
      });
    }

    const request = await ResourceRequest.create({
      requesterId: req.user.id,
      campName,
      type,
      quantityNeeded,
      consumptionRatePerHour: consumptionRatePerHour || 0,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      },
    });

    res.status(201).json({ request });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create resource request', error: err.message });
  }
};

// @route  GET /api/resource-requests
// @access Protected — authority/ngo
module.exports.getAllResourceRequests = async (req, res) => {
  try {
    const requests = await ResourceRequest.find()
      .populate('requesterId', 'name phone email')
      .sort({ createdAt: -1 });
    res.status(200).json({ count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resource requests', error: err.message });
  }
};

// @route  POST /api/resources/match
// @access Protected — authority only
// Body: { requestId }
module.exports.matchResources = async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ message: 'requestId is required' });
    }

    const request = await ResourceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Resource request not found' });
    }

    const candidates = await Resource.find({ type: request.type, status: 'available' });

    if (candidates.length === 0) {
      return res.status(200).json({ message: 'No available resources of this type', matches: [] });
    }

    const scored = candidates
      .map((resource) => ({
        resource,
        ...scoreResourceMatch(resource, request),
      }))
      .sort((a, b) => b.score - a.score);

    res.status(200).json({
      request,
      matches: scored.map((s) => ({
        resourceId: s.resource._id,
        providerId: s.resource.providerId,
        quantity: s.resource.quantity,
        distanceKm: s.distanceKm,
        transportAvailable: s.resource.transportAvailable,
        score: s.score,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to match resources', error: err.message });
  }
};

// @route  POST /api/resources/allocate
// @access Protected — authority only
// Body: { requestId, resourceId, quantityAllocated }
module.exports.allocateResource = async (req, res) => {
  try {
    const { requestId, resourceId, quantityAllocated } = req.body;

    if (!requestId || !resourceId || !quantityAllocated) {
      return res.status(400).json({
        message: 'requestId, resourceId and quantityAllocated are required',
      });
    }

    const request = await ResourceRequest.findById(requestId);
    const resource = await Resource.findById(resourceId);

    if (!request || !resource) {
      return res.status(404).json({ message: 'Request or resource not found' });
    }

    if (resource.quantity < quantityAllocated) {
      return res.status(400).json({ message: 'Resource does not have enough quantity' });
    }

   
    resource.quantity -= quantityAllocated;
    if (resource.quantity === 0) resource.status = 'depleted';
    await resource.save();

   
    request.quantityFulfilled += Number(quantityAllocated);
    request.matchedResourceId = resource._id;
    request.status =
      request.quantityFulfilled >= request.quantityNeeded ? 'fulfilled' : 'partially-fulfilled';
    await request.save();

    const io = req.app.get('io');
    io.emit('resource-allocated', { requestId: request._id, resourceId: resource._id });

    res.status(200).json({ message: 'Resource allocated', request, resource });
  } catch (err) {
    res.status(500).json({ message: 'Failed to allocate resource', error: err.message });
  }
};

// @route  GET /api/resource-requests/shortage-alerts
// @access Protected — authority only
// Predicts which open requests will run out soon, based on consumption rate
module.exports.getShortageAlerts = async (req, res) => {
  try {
    const requests = await ResourceRequest.find({
      status: { $in: ['open', 'partially-fulfilled'] },
      consumptionRatePerHour: { $gt: 0 },
    });

    const alerts = requests
      .map((r) => {
        const remaining = r.quantityFulfilled; // what's currently on hand
        const hoursLeft = remaining / r.consumptionRatePerHour;
        return {
          requestId: r._id,
          campName: r.campName,
          type: r.type,
          remaining,
          consumptionRatePerHour: r.consumptionRatePerHour,
          hoursUntilShortage: Math.round(hoursLeft * 10) / 10,
        };
      })
      .filter((a) => a.hoursUntilShortage < 24) // flag anything running out within a day
      .sort((a, b) => a.hoursUntilShortage - b.hoursUntilShortage);

    res.status(200).json({ count: alerts.length, alerts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute shortage alerts', error: err.message });
  }
};