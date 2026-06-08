// Este archivo centraliza todas las peticiones HTTP al servicio Node.js

// URL del servicio local (Node.js)
// Puerto 3001 es donde corre el servicio Node.js
const API_URL = 'http://localhost:3001/api';

/**
 * Obtener todas las solicitudes
 * @returns {Promise<Array>} Array de solicitudes
 */
export async function getRequests() {
  try {
    const response = await fetch(`${API_URL}/requests`);
    if (!response.ok) throw new Error('Error al obtener solicitudes');
    return await response.json();
  } catch (error) {
    console.error('Error en getRequests:', error);
    return [];
  }
}

/**
 * Obtener una solicitud específica por ID
 * @param {string} id - ID de la solicitud
 * @returns {Promise<Object>} Objeto de la solicitud
 */
export async function getRequestById(id) {
  try {
    const response = await fetch(`${API_URL}/requests/${id}`);
    if (!response.ok) throw new Error('Solicitud no encontrada');
    return await response.json();
  } catch (error) {
    console.error('Error en getRequestById:', error);
    return null;
  }
}

/**
 * Crear una nueva solicitud
 * @param {Object} request - Objeto con {name, operationCode, payload}
 * @returns {Promise<Object>} Objeto de la solicitud creada
 */
export async function createRequest(request) {
  try {
    // Validaciones básicas antes de enviar
    if (!request?.name || !request?.operationCode || !request?.payload) {
      throw new Error('name, operationCode y payload son obligatorios');
    }

    // fetch envía la solicitud como JSON
    const response = await fetch(`${API_URL}/requests`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',  
      },
      body: JSON.stringify(request),  
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al crear solicitud');
    }

    if (!data?.request) {
      throw new Error('La respuesta de creación no tiene el formato esperado.');
    }

    return data.request;
  } catch (error) {
    console.error('Error en createRequest:', error);
    throw error;  
  }
}

/**
 * Obtener operaciones disponibles
 * @returns {Promise<Array>} Array de OperationDefinition
 */
export async function getOperations() {
  try {
    const response = await fetch(`${API_URL}/operations`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener operaciones');
    }

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error en getOperations:', error);
    return [];
  }
}

/**
 * Sincronizar solicitudes pendientes con el backend
 * Esto ordena a Node.js que envíe las solicitudes al backend .NET
 * @returns {Promise<Object>} Resultado de la sincronización
 */
export async function syncRequests() {
  try {
    const response = await fetch(`${API_URL}/requests/sync`, {
      method: 'POST', 
    });

    if (!response.ok) throw new Error('Error en sincronización');
    return await response.json();
  } catch (error) {
    console.error('Error en syncRequests:', error);
    throw error;
  }
}
