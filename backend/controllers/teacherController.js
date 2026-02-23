const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');

exports.getTeachersBySubject = async (req, res) => {
    try {
        const teachers = await Teacher.findBySubject(req.params.subjectId);
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.findAll();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTeacher = async (req, res) => {
    try {
        const newTeacher = { ...req.body, id: 'teacher_' + Date.now() };
        await Teacher.create(newTeacher);
        res.status(201).json(newTeacher);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        await Teacher.update(req.params.id, req.body);
        res.json({ message: 'Teacher updated successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        await Teacher.delete(req.params.id);
        res.json({ message: 'Teacher deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
