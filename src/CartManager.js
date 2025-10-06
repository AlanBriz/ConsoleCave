const path = require('path');
const { readJson, writeJson } = require('./utils');

class CartManager {
  constructor(filename = 'data/carts.json') {
    this.filePath = path.resolve(filename);
  }

  async getAll() {
    return await readJson(this.filePath);
  }

  async getById(id) {
    const items = await this.getAll();
    return items.find(c => String(c.id) === String(id)) || null;
  }

  async _generateId(items) {
    const max = items.reduce((m, it) => {
      const n = Number(it.id);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);
    return String(max + 1);
  }

  async create() {
    const items = await this.getAll();
    const id = await this._generateId(items);
    const cart = { id, products: [] };
    items.push(cart);
    await writeJson(this.filePath, items);
    return cart;
  }

  async addProductToCart(cid, pid, quantity = 1) {
    const items = await this.getAll();
    const idx = items.findIndex(c => String(c.id) === String(cid));
    if (idx === -1) return null;
    const cart = items[idx];
    const prodIdx = cart.products.findIndex(p => String(p.product) === String(pid));
    if (prodIdx === -1) {
      cart.products.push({ product: String(pid), quantity: Number(quantity) });
    } else {
      cart.products[prodIdx].quantity = Number(cart.products[prodIdx].quantity) + Number(quantity);
    }
    items[idx] = cart;
    await writeJson(this.filePath, items);
    return cart;
  }
}

module.exports = CartManager;
