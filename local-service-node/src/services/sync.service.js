const axios = require('axios');
const requestService = require('./request.service');
const { SolicitudStatus } = require('../../../domain/solicitud');
const { BACKEND_URL } = require('../config/backend.config');

// Servicio de sincronización.

async function syncRequests() {
  const allRequests = await requestService.getRequests();
  const requestsToSync = allRequests.filter(
    (request) =>
      request.status === SolicitudStatus.Pending ||
      request.status === SolicitudStatus.Failed,
  );

  if (requestsToSync.length === 0) {
    return {
      message: 'No hay solicitudes para sincronizar',
      totalPending: 0,
      processed: 0,
      failed: 0,
    };
  }

  // Comprobar disponibilidad del backend antes de procesar las solicitudes.
  try {
    // Si el backend responde (incluso con 4xx/5xx) consideramos que está disponible.
    await axios.get(BACKEND_URL, { timeout: 2000 });
  } catch (err) {
    if (!err.response) {
      console.error(`API de sincronización no disponible: ${err.message}`);
      return {
        message: 'API de sincronización no disponible — no se modificaron estados',
        totalPending: requestsToSync.length,
        processed: 0,
        failed: 0,
      };
    }
    // Si err.response existe, el servidor respondió con un status; seguimos con la sincronización.
  }

  let processed = 0;
  let failed = 0;

  for (const request of requestsToSync) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/operations/execute`, {
        requestId: request.id,
        operationCode: request.operationCode,
        payload: request.payload,
      });

      if (response.data?.success === true) {
        await requestService.updateRequest(request.id, {
          ...request,
          status: SolicitudStatus.Processed,
          result: response.data?.result ?? null,
          errorMessage: null,
          syncedAt: new Date().toISOString(),
        });
        processed += 1;
      } else {
        await requestService.updateRequest(request.id, {
          ...request,
          status: SolicitudStatus.Failed,
          result: null,
          errorMessage: response.data?.message || 'Error desconocido en sincronización.',
          syncedAt: null,
        });
        failed += 1;
      }
    } catch (error) {
      // Si no hay `error.response` es un fallo de red / backend no disponible.
      if (!error.response) {
        console.error(
          `API de sincronización se perdió durante la sincronización: ${error.message}`,
        );
        return {
          message: 'Sincronización abortada — API no disponible durante la operación',
          totalPending: requestsToSync.length,
          processed,
          failed,
          aborted: true,
        };
      }

      const backendErrorMessage =
        error.response?.data?.message || error.response?.data?.error || error.message;

      console.error(
        `Falló la sincronización de la solicitud ${request.id}: ${backendErrorMessage}`,
      );
      await requestService.updateRequest(request.id, {
        ...request,
        status: SolicitudStatus.Failed,
        result: null,
        errorMessage: backendErrorMessage,
        syncedAt: null,
      });
      failed += 1;
    }
  }

  return {
    message: 'Sincronización finalizada',
    totalPending: requestsToSync.length,
    processed,
    failed,
  };
}

module.exports = {
  syncRequests,
};
