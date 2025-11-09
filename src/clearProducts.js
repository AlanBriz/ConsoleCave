// clearProducts.js
import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');

  await Product.deleteMany({});
  console.log('All products removed');

  process.exit();
}).catch(err => {
  console.error(err);
});
