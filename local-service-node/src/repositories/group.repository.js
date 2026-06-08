
const fs = require('fs').promises;
const path = require('path');

// Ruta correcta: desde src/repositories/ suben 2 niveles a la raíz, luego data/
const GRUPOS_FILE = path.join(__dirname, '../../data/grupos.json');
const VALID_STATUS_FILTERS = new Set(['Pending', 'Processed', 'Failed']);
const SYSTEM_GROUP_STATUS_BY_ID = Object.freeze({
  '1': 'Pending',
  '2': 'Processed',
  '3': 'Failed',
});

const SYSTEM_GROUP_STATUS_BY_NAME = Object.freeze({
  'por procesar': 'Pending',
  procesadas: 'Processed',
  'con error': 'Failed',
});

function normalizeName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function inferSystemMetadata(group) {
  const statusFilterById = SYSTEM_GROUP_STATUS_BY_ID[String(group?.id)];
  if (statusFilterById) {
    return {
      isSystem: true,
      statusFilter: statusFilterById,
    };
  }

  const normalizedName = normalizeName(group?.name);
  const statusFilter = SYSTEM_GROUP_STATUS_BY_NAME[normalizedName];

  if (statusFilter) {
    return {
      isSystem: true,
      statusFilter,
    };
  }

  return {
    isSystem: false,
    statusFilter: null,
  };
}

function migrateGroup(group) {
  const inferred = inferSystemMetadata(group);
  const migrated = { ...group };
  let changed = false;

  if (typeof migrated.isSystem !== 'boolean') {
    migrated.isSystem = inferred.isSystem;
    changed = true;
  }

  const hasValidStatusFilter =
    migrated.statusFilter === null ||
    (typeof migrated.statusFilter === 'string' && VALID_STATUS_FILTERS.has(migrated.statusFilter));

  if (!hasValidStatusFilter) {
    migrated.statusFilter = inferred.statusFilter;
    changed = true;
  }

  if (migrated.isSystem === true) {
    const normalizedName = normalizeName(migrated.name);
    const statusFilterById = SYSTEM_GROUP_STATUS_BY_ID[String(migrated.id)] || null;
    const statusFilterByName = SYSTEM_GROUP_STATUS_BY_NAME[normalizedName] || null;
    const existingValidStatusFilter =
      typeof migrated.statusFilter === 'string' && VALID_STATUS_FILTERS.has(migrated.statusFilter)
        ? migrated.statusFilter
        : null;
    const expectedStatusFilter =
      statusFilterById || statusFilterByName || existingValidStatusFilter || inferred.statusFilter;

    if (migrated.statusFilter !== expectedStatusFilter) {
      migrated.statusFilter = expectedStatusFilter;
      changed = true;
    }
  } else if (migrated.statusFilter !== null) {
    migrated.statusFilter = null;
    changed = true;
  }

  return {
    group: migrated,
    changed,
  };
}

/**
 * Inicializar archivo de grupos si no existe
 */
async function ensureFile() {
  try {
    await fs.access(GRUPOS_FILE);
  } catch {
    // Archivo no existe, crearlo vacío
    await fs.writeFile(GRUPOS_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Obtener todos los grupos del archivo JSON
 * @returns {Promise<Array>} Array de grupos
 */
async function getAll() {
  try {
    await ensureFile();
    const data = await fs.readFile(GRUPOS_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      throw new Error('El archivo de grupos debe contener un arreglo JSON.');
    }

    let hasChanges = false;
    const migratedGroups = parsed.map((group) => {
      const result = migrateGroup(group);
      if (result.changed) {
        hasChanges = true;
      }
      return result.group;
    });

    if (hasChanges) {
      await fs.writeFile(GRUPOS_FILE, JSON.stringify(migratedGroups, null, 2));
    }

    return migratedGroups;
  } catch (error) {
    console.error('Error leyendo grupos:', error);
    return [];
  }
}

/**
 * Guardar un nuevo grupo
 * @param {Object} group - Objeto grupo con {id, name, description, color, createdAt}
 */
async function save(group) {
  try {
    const grupos = await getAll();
    // Agregar nuevo grupo al array
    grupos.push(group);
    // Guardar en archivo
    await fs.writeFile(GRUPOS_FILE, JSON.stringify(grupos, null, 2));
  } catch (error) {
    throw new Error(`Error guardando grupo: ${error.message}`);
  }
}

/**
 * Actualizar un grupo existente
 * @param {string} groupId - ID del grupo
 * @param {Object} updatedGroup - Objeto grupo actualizado
 */
async function update(groupId, updatedGroup) {
  try {
    const grupos = await getAll();
    // Buscar el índice del grupo
    const index = grupos.findIndex(g => g.id === groupId);
    if (index === -1) {
      throw new Error('Grupo no encontrado');
    }
    // Reemplazar grupo
    grupos[index] = updatedGroup;
    // Guardar cambios
    await fs.writeFile(GRUPOS_FILE, JSON.stringify(grupos, null, 2));
  } catch (error) {
    throw new Error(`Error actualizando grupo: ${error.message}`);
  }
}

/**
 * Eliminar un grupo
 * @param {string} groupId - ID del grupo a eliminar
 */
async function delete_(groupId) {
  try {
    let grupos = await getAll();
    // Filtrar grupo a eliminar
    grupos = grupos.filter(g => g.id !== groupId);
    // Guardar cambios
    await fs.writeFile(GRUPOS_FILE, JSON.stringify(grupos, null, 2));
  } catch (error) {
    throw new Error(`Error eliminando grupo: ${error.message}`);
  }
}

module.exports = {
  getAll,
  save,
  update,
  delete: delete_,
};
