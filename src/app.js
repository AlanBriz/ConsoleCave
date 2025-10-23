import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import ProductManager from './ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Views routes
const productManager = new ProductManager('data/products.json');

app.get('/home', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('home', { products });
});

app.get('/realtimeproducts', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('realTimeProducts', { products });
});

// Start server + socket.io
const httpServer = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('A client connected');

  socket.on('newProduct', async (productData) => {
    await productManager.addProduct(productData);
    const updatedProducts = await productManager.getProducts();
    io.emit('updateProducts', updatedProducts);
  });

  socket.on('deleteProduct', async (id) => {
    await productManager.deleteProduct(id);
    const updatedProducts = await productManager.getProducts();
    io.emit('updateProducts', updatedProducts);
  });
});
