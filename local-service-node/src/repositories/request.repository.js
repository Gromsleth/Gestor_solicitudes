const fs = require('fs/promises');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/solicitudes.json');

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
    throw new Error('El archivo de solicitudes debe contener un arreglo JSON.');
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

async function getById(id) {
  const records = await readAllRecords();
  return records.find((item) => item.id === id) || null;
}

async function create(request) {
  const records = await readAllRecords();
  records.push(request);
  await writeAllRecords(records);
  return request;
}

async function update(id, updatedRequest) {
  const records = await readAllRecords();
  const index = records.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  records[index] = updatedRequest;
  await writeAllRecords(records);
  return updatedRequest;
}

async function getPending() {
  const records = await readAllRecords();
  return records.filter((item) => item.status === 'Pending');
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  getPending,
};
