const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');

router.get('/', interactionController.getInteractions);
router.post('/', interactionController.createInteraction);

module.exports = router;
