const SOSReport = require('../models/report.js');
const uploadBufferToCloudinary = require('../utils/cloudinaryUpload.js');
const calculateSeverity = require('../utils/severity.js');

module.exports.createSOS = async(req,res) => {
    try{
        const {description, peopleCount, longitude, latitude} = req.body;

        if (!description || !latitude || !longitude){
            return res.status(400).json({
                message: 'description, longitude and latitude are required',
            });
        }

        let photoUrl = null;
        if (req.file) {
            const result = await uploadBufferToCloudinary(req.file.buffer);
            photoUrl = result.secure_url;
        }

        const {severityScore, category} = calculateSeverity({
            description,
            peopleCount: peopleCount || 1,
            hasPhoto: !!photoUrl,
        });

        const sosReport = await SOSReport.create({
            reporterId: req.user.id,
            description,
            peopleCount: peopleCount || 1,
            photoUrl: photoUrl,
            location: {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)],
            },
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
};

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
};

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

module.exports.updateSOSStatus = async(req,res)=>{
    try{
        const {status} = req.body;
        const validStatuses = ['pending', 'assigned', 'in-progress', 'resolved'];

        if(!status || !validStatuses.includes(status)){
            return res.status(400).json({
                message: `status must be one of: ${validStatuses.join(', ')}`,
            });
        }
        const report = await SOSReport.findById(req.params.id);
        if (!report){
            return res.status(404).json({message: 'SOS report not found'});
        }
        report.status = status;
        await report.save();

        res.status(200).json({message: 'Status updated', sosReport: report});
    }
    catch(err){
        res.status(500).json({message: 'Failed to update status', error: 'err.message'});
    }
};

module.exports.cancelSOS = async(req,res) => {
    try{
        const report = await SOSReport.findById(req.params.id);
        if (!report){
            return res.status(404).json({message: 'SOS Report not found'});
        }

        const isOwner = report.reporterId.toString() == req.user.id;
        const isAuthority = req.user.role == 'authority';

        if (!isOwner && !isAuthority){
            return res.status(403).json({message: 'Not authorizred to cancel this sos report'});
        }

        report.status = 'resolved';
        report.cancelledAt = new Date();
        await report.save();

        res.status(200).json({message: 'SOS report cancelled', sosReport: report});

    }
    catch(err){
        res.status(500).json({message: 'Failed to cancel SOS report', error: err.message});
    }
};

