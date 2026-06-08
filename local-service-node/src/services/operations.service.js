const axios = require('axios');
const operationsRepository = require('../repositories/operations.repository');
const { BACKEND_URL } = require('../config/backend.config');

/**
 * Obtiene operaciones del backend y las cachea localmente.
 * Si el backend no está disponible, devuelve la cache local.
 */
async function getOperations() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/operations`, {
      timeout: 5000,
    });

    if (!Array.isArray(response.data)) {
      throw new Error('El backend respondió operaciones en formato inválido.');
    }

    await operationsRepository.replaceAll(response.data);
    return response.data;
  } catch (error) {
    const cachedOperations = await operationsRepository.getAll();

    if (cachedOperations.length > 0) {
      return cachedOperations;
    }

    throw new Error(
      'No fue posible obtener operaciones del backend y no existe cache local disponible.',
    );
  }
}

module.exports = {
  getOperations,
};

