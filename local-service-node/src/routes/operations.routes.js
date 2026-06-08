const express = require('express');
const operationsController = require('../controllers/operations.controller');

const router = express.Router();

router.get('/', operationsController.getOperations);

module.exports = router;

