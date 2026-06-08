const requestService = require('../services/request.service');
const { syncRequests } = require('../services/sync.service');

async function getRequests(_req, res) {
  const requests = await requestService.getRequests();
  res.json(requests);
}

async function getRequestById(req, res) {
  const request = await requestService.getRequestById(req.params.id);

  if (!request) {
    return res.status(404).json({ message: 'Solicitud no encontrada' });
  }

  return res.json(request);
}

async function createRequest(req, res) {
  try {
    const request = await requestService.createRequest(req.body);
    return res.status(201).json({
      message: 'Solicitud creada localmente',
      request,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function syncRequestsHandler(_req, res) {
  try {
    const result = await syncRequests();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getRequests,
  getRequestById,
  createRequest,
  syncRequests: syncRequestsHandler,
};
