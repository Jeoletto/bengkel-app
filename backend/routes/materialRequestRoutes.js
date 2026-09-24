const express = require('express');
const router = express.Router();
const materialRequestController = require('../controllers/materialRequestController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/ajukan', verifyToken, materialRequestController.ajukanPermintaan);
router.patch('/:id/approve', verifyToken, materialRequestController.approvePermintaan);
router.post('/scan-penyerahan', verifyToken, materialRequestController.scanPenyerahan);

module.exports = router;