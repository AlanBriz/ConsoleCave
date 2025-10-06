const fs = require('fs').promises;
const path = require('path');

async function readJson(filePath) {
  try {
    await fs.access(filePath);
  } catch (err) {
    await fs.writeFile(filePath, '[]', 'utf8');
  }
  const raw = await fs.readFile(filePath, 'utf8');
  try {
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readJson, writeJson };