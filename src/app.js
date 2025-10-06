const express = require('express');
const path = require('path');
const app = express();
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// basic health
app.get('/', (req, res) => res.send({ ok: true, message: 'Products & Carts API' }));

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));