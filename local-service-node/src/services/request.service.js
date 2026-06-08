const { v4: uuidv4 } = require('uuid');
const { createSolicitud, SolicitudStatus } = require('../../../domain/solicitud');
const requestRepository = require('../repositories/request.repository');

// Servicio de aplicación para solicitudes.

function validateCreatePayload(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('El cuerpo de la solicitud es obligatorio.');
  }

  const { name, operationCode, payload } = body;

  if (typeof name !== 'string' || name.trim() === '') {
    throw new Error('El campo "name" es obligatorio.');
  }

  if (typeof operationCode !== 'string' || operationCode.trim() === '') {
    throw new Error('El campo "operationCode" es obligatorio.');
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('El campo "payload" es obligatorio y debe ser un objeto JSON.');
  }
}

async function getRequests() {
  return requestRepository.getAll();
}

async function getRequestById(id) {
  if (!id) {
    throw new Error('El id es obligatorio.');
  }

  return requestRepository.getById(id);
}

async function createRequest(body) {
  validateCreatePayload(body);

  const request = createSolicitud({
    id: uuidv4(),
    name: body.name,
    operationCode: body.operationCode,
    payload: body.payload,
    status: SolicitudStatus.Pending,
    result: null,
    errorMessage: null,
    createdAt: new Date(),
    syncedAt: null,
  });

  return requestRepository.create(request);
}

async function updateRequest(id, updatedRequest) {
  return requestRepository.update(id, updatedRequest);
}

async function getPendingRequests() {
  return requestRepository.getPending();
}

module.exports = {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  getPendingRequests,
  validateCreatePayload,
};
