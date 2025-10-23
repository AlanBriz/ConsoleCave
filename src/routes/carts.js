import { Router } from 'express';
import CartManager from '../CartManager.js';

const router = Router();
const cartManager = new CartManager(); 

// POST /api/carts - create new cart
router.post('/', async (req, res) => {
  const cart = await cartManager.createCart();
  res.status(201).json(cart);
});

// GET /api/carts/:cid - get products in cart
router.get('/:cid', async (req, res) => {
  const cart = await cartManager.getCartById(req.params.cid);
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  res.json(cart.products);
});

// POST /api/carts/:cid/product/:pid - add product to cart
router.post('/:cid/product/:pid', async (req, res) => {
  const updatedCart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
  if (!updatedCart) return res.status(404).json({ error: 'Cart not found' });
  res.json(updatedCart);
});

export default router;
