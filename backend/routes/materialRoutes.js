const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, materialController.getAllMaterials);
router.post('/', verifyToken, materialController.createMaterial);
router.put('/:id', verifyToken, materialController.updateMaterial);
router.delete('/:id', verifyToken, materialController.deleteMaterial);

module.exports = router;