const path = require('path');
const { readJson, writeJson } = require('./utils');

class ProductManager {
  constructor(filename = 'data/products.json') {
    this.filePath = path.resolve(filename);
  }

  async getAll() {
    return await readJson(this.filePath);
  }

  async getById(id) {
    const items = await this.getAll();
    return items.find(p => String(p.id) === String(id)) || null;
  }

  async _generateId(items) {
    // incremental numeric id based on max existing id
    const max = items.reduce((m, it) => {
      const n = Number(it.id);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);
    return String(max + 1);
  }

  async add(product) {
    const items = await this.getAll();
    const id = await this._generateId(items);
    const now = { ...product, id };
    items.push(now);
    await writeJson(this.filePath, items);
    return now;
  }

  async update(id, changes) {
    const items = await this.getAll();
    const idx = items.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return null;
    // Never allow id change
    const updated = { ...items[idx], ...changes, id: items[idx].id };
    items[idx] = updated;
    await writeJson(this.filePath, items);
    return updated;
  }

  async delete(id) {
    const items = await this.getAll();
    const idx = items.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return false;
    items.splice(idx, 1);
    await writeJson(this.filePath, items);
    return true;
  }
}

module.exports = ProductManager;