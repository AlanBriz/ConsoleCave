const express = require('express');
const router = express.Router();
const CartManager = require('../CartManager');
const ProductManager = require('../ProductManager');
const cm = new CartManager();
const pm = new ProductManager();

// POST /api/carts/ -> create cart
router.post('/', async (req, res, next) => {
  try {
    const cart = await cm.create();
    res.status(201).json(cart);
  } catch (err) { next(err); }
});

// GET /api/carts/:cid -> list products in cart
router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await cm.getById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    res.json(cart.products);
  } catch (err) { next(err); }
});

// POST /api/carts/:cid/product/:pid -> add product to cart (quantity increments by 1)
router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    // verify product exists
    const product = await pm.getById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const cart = await cm.addProductToCart(req.params.cid, req.params.pid, 1);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    res.json(cart);
  } catch (err) { next(err); }
});

module.exports = router;