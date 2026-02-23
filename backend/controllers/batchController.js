const Batch = require('../models/Batch');

exports.getBatches = async (req, res) => {
    try {
        const batches = await Batch.findAll();
        res.json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        res.json(batch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createBatch = async (req, res) => {
    try {
        // Only use data from request body, generate id if not provided
        const batchData = { ...req.body };
        if (!batchData.id) {
            batchData.id = 'batch_' + Date.now();
        }
        await Batch.create(batchData);
        res.status(201).json(batchData);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateBatch = async (req, res) => {
    try {
        await Batch.update(req.params.id, req.body);
        const updated = await Batch.findById(req.params.id);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteBatch = async (req, res) => {
    try {
        await Batch.delete(req.params.id);
        res.json({ message: 'Batch deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
