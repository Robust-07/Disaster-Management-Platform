const SOSReport = require('../models/report.js');
const uploadBufferToCloudinary = require('../utils/cloudinaryUpload.js');
const predictSOSSeverity = require('../utils/mlService.js');

module.exports.createSOS = async(req,res) => {
    try{
        const {
            description,
            peopleCount,
            longitude,
            latitude,
            injured_people,
            critical_injuries,
            children_elderly,
            water_level,
            building_damage,
            hours_trapped,
            communication_available
        } = req.body;

        if (!description || !latitude || !longitude){
            return res.status(400).json({
                message: 'description, longitude and latitude are required',
            });
        }

        const numPeopleCount = Number(peopleCount || 1);
        const numInjured = Number(injured_people);
        const numCritical = Number(critical_injuries);
        const numChildrenElderly = Number(children_elderly);
        const numWaterLevel = Number(water_level);
        const numBuildingDamage = Number(building_damage);
        const numHoursTrapped = Number(hours_trapped);
        const numCommAvailable = Number(communication_available);

        if (
            injured_people === undefined || isNaN(numInjured) ||
            critical_injuries === undefined || isNaN(numCritical) ||
            children_elderly === undefined || isNaN(numChildrenElderly) ||
            water_level === undefined || isNaN(numWaterLevel) ||
            building_damage === undefined || isNaN(numBuildingDamage) ||
            hours_trapped === undefined || isNaN(numHoursTrapped) ||
            communication_available === undefined || isNaN(numCommAvailable)
        ) {
            return res.status(400).json({
                message: 'Missing required ML feature inputs: injured_people, critical_injuries, children_elderly, water_level, building_damage, hours_trapped, and communication_available are required numbers.'
            });
        }

        if (numPeopleCount < 1) {
            return res.status(400).json({ message: 'peopleCount must be at least 1' });
        }
        if (numInjured < 0 || numCritical < 0 || numChildrenElderly < 0 || numWaterLevel < 0 || numBuildingDamage < 0 || numHoursTrapped < 0) {
            return res.status(400).json({ message: 'ML numerical inputs cannot be negative' });
        }
        if (numCommAvailable !== 0 && numCommAvailable !== 1) {
            return res.status(400).json({ message: 'communication_available must be 0 or 1' });
        }
        if (numInjured > numPeopleCount) {
            return res.status(400).json({ message: 'injured_people cannot exceed peopleCount' });
        }
        if (numCritical > numInjured) {
            return res.status(400).json({ message: 'critical_injuries cannot exceed injured_people' });
        }
        if (numChildrenElderly > numPeopleCount) {
            return res.status(400).json({ message: 'children_elderly cannot exceed peopleCount' });
        }

        let photoUrl = null;
        if (req.file) {
            const result = await uploadBufferToCloudinary(req.file.buffer);
            photoUrl = result.secure_url;
        }

        const mlPrediction = await predictSOSSeverity({
            peopleCount: numPeopleCount,
            injured_people: numInjured,
            critical_injuries: numCritical,
            children_elderly: numChildrenElderly,
            water_level: numWaterLevel,
            building_damage: numBuildingDamage,
            hours_trapped: numHoursTrapped,
            communication_available: numCommAvailable
        });

        const sosReport = await SOSReport.create({
            reporterId: req.user.id,
            description,
            peopleCount: numPeopleCount,
            injuredPeople: numInjured,
            criticalInjuries: numCritical,
            childrenElderly: numChildrenElderly,
            waterLevel: numWaterLevel,
            buildingDamage: numBuildingDamage,
            hoursTrapped: numHoursTrapped,
            communicationAvailable: numCommAvailable,
            photoUrl: photoUrl,
            location: {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)],
            },
            severityScore: mlPrediction.severityScore,
            severityLabel: mlPrediction.severityLabel,
            mlProbability: mlPrediction.mlProbability,
            isMlPredicted: mlPrediction.isMlPredicted,
            mlStatus: mlPrediction.mlStatus
        });
        res.status(201).json({sosReport});
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: 'Submission failed', error: err.message
        });
    }
};

module.exports.getAllSOS = async(req,res) => {
    try{
        const reports = await SOSReport.find()
        .populate('reporterId', 'name phone email')
        .sort({createdAt: -1});
        res.status(200).json({ count: reports.length, reports});

    }
    catch(err){
        res.status(500).json({message: 'Failed to fetch report', error: err.message});

    };
}

module.exports.getSOSById = async(req,res) => {
    try{
        const report = await SOSReport.findById(req.params.id).populate(
            'reporterId',
            'name phone email'
        );
        if (!report){
            return res.status(404).json({message: 'report not found'})
        }
        res.status(200).json({report});

    }
    catch(err){
        res.status(500).json({message: 'Failed to fetch report', error: err.message});
    }
}

module.exports.getMySOS = async(req, res) => {
    try{
        const reports = await SOSReport.find().
        populate({reporterId: req.user.id})
        .sort({createdAt: -1});
        res.status(200).json({count: reports.length, reports});
    }
    catch(err){
        res.status(500).json({message: 'Failed to fetch SOSReport', error: err.message});
    }

};

