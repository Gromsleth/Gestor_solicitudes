const fs = require('fs/promises');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/operations-cache.json');

async function ensureStorage() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, '[]\n', 'utf8');
  }
}

async function readAllRecords() {
  await ensureStorage();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const parsed = raw.trim() ? JSON.parse(raw) : [];

  if (!Array.isArray(parsed)) {
    throw new Error('El archivo operations-cache.json debe contener un arreglo JSON.');
  }

  return parsed;
}

async function writeAllRecords(records) {
  await ensureStorage();
  const payload = `${JSON.stringify(records, null, 2)}\n`;
  await fs.writeFile(DATA_FILE, payload, 'utf8');
}

async function getAll() {
  return readAllRecords();
}

async function replaceAll(operations) {
  if (!Array.isArray(operations)) {
    throw new Error('Las operaciones deben enviarse como arreglo.');
  }

  await writeAllRecords(operations);
  return operations;
}

module.exports = {
  getAll,
  replaceAll,
};

