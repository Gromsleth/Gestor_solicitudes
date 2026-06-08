// Lógica de negocio de grupos.

const groupRepository = require('../repositories/group.repository');
const { v4: uuidv4 } = require('uuid');

/**
 * Crear un nuevo grupo
 * @param {Object} groupData - {name, description, color}
 * @returns {Promise<Object>} Grupo creado
 */
async function createGroup(groupData) {
  // Validar que tenga nombre
  if (!groupData.name || groupData.name.trim() === '') {
    throw new Error('El nombre del grupo es obligatorio');
  }

  // Crear objeto grupo con ID único
  const newGroup = {
    id: uuidv4(),
    name: groupData.name,
    description: groupData.description || '',
    color: groupData.color || '#3498db', 
    createdAt: new Date().toISOString(),
    isSystem: false,
    statusFilter: null,
  };

  // Guardar en el repositorio
  await groupRepository.save(newGroup);
  return newGroup;
}

/**
 * Obtener todos los grupos
 * @returns {Promise<Array>} Array de grupos
 */
async function getGroups() {
  return await groupRepository.getAll();
}

/**
 * Obtener un grupo por ID
 * @param {string} groupId - ID del grupo
 * @returns {Promise<Object>} Objeto del grupo
 */
async function getGroupById(groupId) {
  const groups = await groupRepository.getAll();
  return groups.find(g => g.id === groupId);
}

/**
 * Actualizar un grupo
 * @param {string} groupId - ID del grupo
 * @param {Object} updates - {name, description, color}
 * @returns {Promise<Object>} Grupo actualizado
 */
async function updateGroup(groupId, updates) {
  if (!updates || typeof updates !== 'object') {
    throw new Error('Los datos de actualización son obligatorios');
  }

  // Obtener grupo actual
  const group = await getGroupById(groupId);
  if (!group) {
    throw new Error('Grupo no encontrado');
  }

  if (group.isSystem === true) {
    throw new Error('No se pueden editar los grupos de estado del sistema');
  }

  // Validar nombre si se actualiza
  if (updates.name && updates.name.trim() === '') {
    throw new Error('El nombre del grupo no puede estar vacío');
  }

  const hasRestrictedFields =
    Object.prototype.hasOwnProperty.call(updates, 'isSystem') ||
    Object.prototype.hasOwnProperty.call(updates, 'statusFilter');

  if (hasRestrictedFields) {
    throw new Error('Los campos isSystem y statusFilter no se pueden modificar manualmente');
  }

  // Crear grupo actualizado
  const allowedUpdates = {
    ...(Object.prototype.hasOwnProperty.call(updates, 'name') ? { name: updates.name } : {}),
    ...(Object.prototype.hasOwnProperty.call(updates, 'description')
      ? { description: updates.description }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(updates, 'color') ? { color: updates.color } : {}),
  };

  const updatedGroup = {
    ...group,
    ...allowedUpdates,
    id: group.id, // No cambiar ID
    createdAt: group.createdAt, // No cambiar fecha de creación
  };

  // Guardar cambios
  await groupRepository.update(groupId, updatedGroup);
  return updatedGroup;
}

/**
 * Eliminar un grupo
 * @param {string} groupId - ID del grupo a eliminar
 * @returns {Promise<void>}
 */
async function deleteGroup(groupId) {
  const group = await getGroupById(groupId);
  if (!group) {
    throw new Error('Grupo no encontrado');
  }

  if (group.isSystem === true) {
    throw new Error('No se pueden eliminar los grupos de estado del sistema');
  }

  await groupRepository.delete(groupId);
}

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
};
