const Video = require('../models/Video');

exports.getAllVideos = async (req, res) => {
    try {
        const { subjectId, batchId, teacherId } = req.query;
        if (subjectId || batchId || teacherId) {
            const videos = await Video.findByFilters({ subjectId, batchId, teacherId });
            return res.json(videos);
        }
        const videos = await Video.findAll();
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ error: 'Video not found' });
        res.json(video);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getVideosBySubject = async (req, res) => {
    try {
        const videos = await Video.findBySubject(req.params.subjectId);
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getVideosByBatch = async (req, res) => {
    try {
        const videos = await Video.findByBatch(req.params.batchId);
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createVideo = async (req, res) => {
    try {
        const newVideo = { ...req.body, id: 'video_' + Date.now() };
        await Video.create(newVideo);
        res.status(201).json(newVideo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateVideo = async (req, res) => {
    try {
        await Video.update(req.params.id, req.body);
        res.json({ message: 'Video updated successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        await Video.delete(req.params.id);
        res.json({ message: 'Video deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
