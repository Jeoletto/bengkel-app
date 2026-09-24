const express = require('express');
const router = express.Router();
const borrowingController = require('../controllers/borrowingController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/ajukan', verifyToken, borrowingController.ajukanPeminjaman);
router.patch('/:id/approve', verifyToken, borrowingController.approvePeminjaman);
router.post('/scan-pickup', verifyToken, borrowingController.scanPickup);
router.post('/scan-return', verifyToken, borrowingController.scanReturn);
router.post('/daily-photo', verifyToken, upload.single('foto'), borrowingController.uploadDailyPhoto);

module.exports = router;