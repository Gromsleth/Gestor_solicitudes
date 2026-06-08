// centraliza todas las peticiones HTTP a los endpoints relacionados con grupos (CRUD)

const API_URL = 'http://localhost:3001/api';

/**
 * Obtener todos los grupos
 * @returns {Promise<Array>} Array de grupos
 */
export async function getGroups() {
  try {
    const response = await fetch(`${API_URL}/groups`);
    if (!response.ok) throw new Error('Error al obtener grupos');
    return await response.json();
  } catch (error) {
    console.error('Error en getGroups:', error);
    return [];
  }
}

/**
 * Crear un nuevo grupo
 * @param {Object} groupData - {name, description, color}
 * @returns {Promise<Object>} Objeto del grupo creado
 */
export async function createGroup(groupData) {
  try {
    // Validaciones básicas
    if (!groupData.name || groupData.name.trim() === '') {
      throw new Error('El nombre del grupo es obligatorio');
    }

    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData),
    });

    if (!response.ok) throw new Error('Error al crear grupo');
    return await response.json();
  } catch (error) {
    console.error('Error en createGroup:', error);
    throw error;
  }
}

/**
 * Actualizar un grupo
 * @param {string} groupId - ID del grupo
 * @param {Object} updates - {name, description, color}
 * @returns {Promise<Object>} Grupo actualizado
 */
export async function updateGroup(groupId, updates) {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error('Error al actualizar grupo');
    return await response.json();
  } catch (error) {
    console.error('Error en updateGroup:', error);
    throw error;
  }
}

/**
 * Eliminar un grupo
 * @param {string} groupId - ID del grupo a eliminar
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export async function deleteGroup(groupId) {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      let errorMessage = 'Error al eliminar grupo';
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Si no llega JSON, mantener mensaje por defecto
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en deleteGroup:', error);
    throw error;
  }
}
