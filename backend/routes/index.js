const express = require('express');
const router = express.Router();

const batchRoutes = require('./batchRoutes');
const subjectRoutes = require('./subjectRoutes');
const teacherRoutes = require('./teacherRoutes');
const videoRoutes = require('./videoRoutes');
const userRoutes = require('./userRoutes');

router.use('/batches', batchRoutes);
router.use('/subjects', subjectRoutes);
router.use('/teachers', teacherRoutes);
router.use('/videos', videoRoutes);
router.use('/users', userRoutes);

module.exports = router;
