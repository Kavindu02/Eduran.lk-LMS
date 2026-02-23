const Subject = require('../models/Subject');

exports.getSubjectsByBatch = async (req, res) => {
    try {
        const subjects = await Subject.findByBatch(req.params.batchId);
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.findAll();
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createSubject = async (req, res) => {
    try {
        const newSubject = { ...req.body, id: 'subject_' + Date.now() };
        await Subject.create(newSubject);
        res.status(201).json(newSubject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        await Subject.update(req.params.id, req.body);
        const updated = await Subject.findById(req.params.id);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        await Subject.delete(req.params.id);
        res.json({ message: 'Subject deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
