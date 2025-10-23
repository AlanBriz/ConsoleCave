import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CartManager {
  constructor() {
    this.path = path.join(__dirname, 'data', 'carts.json');
  }

  // Get all carts
  async getCarts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  // Get one cart by ID
  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find((c) => c.id === id);
  }

  // Create a new cart
  async createCart() {
    const carts = await this.getCarts();
    const newId = carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;

    const newCart = {
      id: newId,
      products: []
    };

    carts.push(newCart);
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return newCart;
  }

  // Add product to cart (increments quantity if exists)
  async addProductToCart(cartId, productId) {
    const carts = await this.getCarts();
    const cart = carts.find((c) => c.id === parseInt(cartId));
    if (!cart) return null;

    const productInCart = cart.products.find((p) => p.product === parseInt(productId));
    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: parseInt(productId), quantity: 1 });
    }

    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return cart;
  }
}

export default CartManager;
