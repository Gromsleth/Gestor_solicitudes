const operationsService = require('../services/operations.service');

async function getOperations(_req, res) {
  try {
    const operations = await operationsService.getOperations();
    return res.json(operations);
  } catch (error) {
    return res.status(503).json({ message: error.message });
  }
}

module.exports = {
  getOperations,
};

