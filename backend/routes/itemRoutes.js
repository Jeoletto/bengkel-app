const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const verifyToken = require('../middleware/authMiddleware');

// ✅ BENAR: Gunakan '/' bukan '/api/items'
router.get('/', verifyToken, itemController.getAllItems);
router.post('/', verifyToken, itemController.createItem);
router.put('/:id', verifyToken, itemController.updateItem);
router.delete('/:id', verifyToken, itemController.deleteItem);

module.exports = router;