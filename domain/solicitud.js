/* Modelo de dominio para una Solicitud */

const SolicitudStatus = Object.freeze({
  Pending: 'Pending',
  Processed: 'Processed',
  Failed: 'Failed',
});

const OperationCodes = Object.freeze({
  CALCULATE_IVA: 'CALCULATE_IVA',
  TEXT_UPPERCASE: 'TEXT_UPPERCASE',
  TEXT_REVERSE: 'TEXT_REVERSE',
  STRUCTURE_JSON: 'STRUCTURE_JSON',
});

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`El campo "${fieldName}" es obligatorio y debe ser texto.`);
  }
}

function assertAllowedValue(value, allowedValues, fieldName) {
  if (!Object.values(allowedValues).includes(value)) {
    throw new Error(
      `El campo "${fieldName}" debe tener uno de estos valores: ${Object.values(allowedValues).join(', ')}.`,
    );
  }
}

function assertPayloadObject(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('El campo "payload" es obligatorio y debe ser un objeto JSON.');
  }
}

function toIsoString(value, fieldName) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`El campo "${fieldName}" debe ser una fecha válida.`);
  }
  return date.toISOString();
}

function createSolicitud({
  id,
  name,
  operationCode,
  payload,
  status = SolicitudStatus.Pending,
  result = null,
  errorMessage = null,
  createdAt = new Date(),
  syncedAt = null,
}) {
  assertNonEmptyString(id, 'id');
  assertNonEmptyString(name, 'name');
  assertNonEmptyString(operationCode, 'operationCode');
  assertPayloadObject(payload);
  assertAllowedValue(status, SolicitudStatus, 'status');

  if (errorMessage !== null && typeof errorMessage !== 'string') {
    throw new Error('El campo "errorMessage" debe ser texto o null.');
  }

  return {
    id,
    name: name.trim(),
    operationCode,
    payload,
    status,
    result,
    errorMessage,
    createdAt: toIsoString(createdAt, 'createdAt'),
    syncedAt: syncedAt ? toIsoString(syncedAt, 'syncedAt') : null,
  };
}

module.exports = {
  SolicitudStatus,
  OperationCodes,
  createSolicitud,
};
