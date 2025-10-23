import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module replacements for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductManager {
  constructor() {
    this.path = path.join(__dirname, 'data', 'products.json');
  }

  // Get all products
  async getProducts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  // Get one product by ID
  async getProductById(id) {
    const products = await this.getProducts();
    return products.find((p) => p.id === parseInt(id));
  }

  // Add new product
  async addProduct(productData) {
    const products = await this.getProducts();
    const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const newProduct = {
      id: newId,
      title: productData.title || 'Untitled',
      description: productData.description || '',
      code: productData.code || '',
      price: productData.price || 0,
      status: productData.status !== undefined ? productData.status : true,
      stock: productData.stock || 0,
      category: productData.category || 'Uncategorized',
      thumbnails: productData.thumbnails || [],
    };

    products.push(newProduct);
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return newProduct;
  }

  // Update product
  async updateProduct(id, updatedData) {
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === parseInt(id));

    if (index === -1) return null;

    products[index] = { ...products[index], ...updatedData, id: products[index].id };

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return products[index];
  }

  // Delete product
  async deleteProduct(id) {
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === parseInt(id));

    if (index === -1) return false;

    products.splice(index, 1);
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return true;
  }
}

export default ProductManager;
