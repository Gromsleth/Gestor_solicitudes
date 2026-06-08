
const express = require('express');
const groupController = require('../controllers/group.controller');

const router = express.Router();

/**
 * GET /api/groups
 * Obtener todos los grupos
 */
router.get('/', groupController.getGroups);

/**
 * GET /api/groups/:id
 * Obtener un grupo específico por ID
 */
router.get('/:id', groupController.getGroupById);

/**
 * POST /api/groups
 * Crear un nuevo grupo
 * Body esperado: {name, description, color}
 */
router.post('/', groupController.createGroup);

/**
 * PUT /api/groups/:id
 * Actualizar un grupo existente
 * Body esperado: {name, description, color} (lo que quieras actualizar)
 */
router.put('/:id', groupController.updateGroup);

/**
 * DELETE /api/groups/:id
 * Eliminar un grupo por ID
 */
router.delete('/:id', groupController.deleteGroup);

module.exports = router;
