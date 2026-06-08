const groupService = require('../services/group.service');

/**
 * GET /api/groups
 * Obtener todos los grupos
 */
async function getGroups(_req, res) {
  try {
    const groups = await groupService.getGroups();
    return res.json(groups);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

/**
 * GET /api/groups/:id
 * Obtener un grupo específico
 */
async function getGroupById(req, res) {
  try {
    const group = await groupService.getGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }
    return res.json(group);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

/**
 * POST /api/groups
 * Crear un nuevo grupo
 */
async function createGroup(req, res) {
  try {
    // req.body contiene {name, description, color}
    const group = await groupService.createGroup(req.body);
    return res.status(201).json(group);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

/**
 * PUT /api/groups/:id
 * Actualizar un grupo
 */
async function updateGroup(req, res) {
  try {
    const group = await groupService.updateGroup(req.params.id, req.body);
    return res.json(group);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

/**
 * DELETE /api/groups/:id
 * Eliminar un grupo
 */
async function deleteGroup(req, res) {
  try {
    await groupService.deleteGroup(req.params.id);
    return res.json({ message: 'Grupo eliminado exitosamente' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};
