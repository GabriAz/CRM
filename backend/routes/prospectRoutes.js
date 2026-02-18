const express = require('express');
const router = express.Router();
const prospectController = require('../controllers/prospectController');

router.get('/', prospectController.getProspects);
router.post('/', prospectController.createProspect);
router.put('/:id/move', prospectController.updateProspectStatus);
router.put('/:id', prospectController.updateProspect);
router.delete('/:id', prospectController.deleteProspect);

module.exports = router;
