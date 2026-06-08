const express = require('express');
const requestController = require('../controllers/request.controller');

const router = express.Router();

router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestById);
router.post('/', requestController.createRequest);
router.post('/sync', requestController.syncRequests);

module.exports = router;
