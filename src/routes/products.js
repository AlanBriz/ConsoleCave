import { Router } from 'express';
import ProductManager from '../ProductManager.js';

const router = Router();
const productManager = new ProductManager(); 

// GET all products
router.get('/', async (req, res) => {
  const products = await productManager.getProducts();
  res.json(products);
});

// GET product by ID
router.get('/:pid', async (req, res) => {
  const product = await productManager.getProductById(req.params.pid);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST new product
router.post('/', async (req, res) => {
  const newProduct = await productManager.addProduct(req.body);
  res.status(201).json(newProduct);
});

// PUT update product
router.put('/:pid', async (req, res) => {
  const updated = await productManager.updateProduct(req.params.pid, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

// DELETE product
router.delete('/:pid', async (req, res) => {
  const deleted = await productManager.deleteProduct(req.params.pid);
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted' });
});

export default router;
