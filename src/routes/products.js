const express = require('express');
const router = express.Router();
const ProductManager = require('../ProductManager');
const pm = new ProductManager();

// GET /api/products/ -> list all
router.get('/', async (req, res, next) => {
  try {
    const all = await pm.getAll();
    res.json(all);
  } catch (err) { next(err); }
});

// GET /api/products/:pid -> one product
router.get('/:pid', async (req, res, next) => {
  try {
    const p = await pm.getById(req.params.pid);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  } catch (err) { next(err); }
});

// POST /api/products/ -> add product
router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    // Basic validation
    const required = ['title','description','code','price','status','stock','category'];
    for (const f of required) {
      if (body[f] === undefined) return res.status(400).json({ error: `Missing field: ${f}` });
    }
    // thumbnails optional, but normalize
    if (!Array.isArray(body.thumbnails)) body.thumbnails = [];
    const product = {
      title: String(body.title),
      description: String(body.description),
      code: String(body.code),
      price: Number(body.price),
      status: Boolean(body.status),
      stock: Number(body.stock),
      category: String(body.category),
      thumbnails: body.thumbnails.map(String)
    };
    const added = await pm.add(product);
    res.status(201).json(added);
  } catch (err) { next(err); }
});

// PUT /api/products/:pid -> update
router.put('/:pid', async (req, res, next) => {
  try {
    const changes = { ...req.body };
    if ('id' in changes) delete changes.id; // never change id
    const updated = await pm.update(req.params.pid, changes);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res, next) => {
  try {
    const ok = await pm.delete(req.params.pid);
    if (!ok) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;