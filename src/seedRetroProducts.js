// seedRetroProducts.js
import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');

  const products = [
    { title: 'Nintendo Entertainment System (NES)', description: 'Classic 8-bit home console', price: 100, category: 'Console' },
    { title: 'Super Nintendo (SNES)', description: '16-bit home console', price: 120, category: 'Console' },
    { title: 'Nintendo Game Boy', description: 'Original handheld console', price: 80, category: 'Handheld' },
    { title: 'Sega Genesis', description: '16-bit home console', price: 90, category: 'Console' },
    { title: 'Game Boy Color', description: 'Handheld console with color screen', price: 100, category: 'Handheld' },
    { title: 'Sony PlayStation', description: 'Original PlayStation console', price: 150, category: 'Console' },
    { title: 'Nintendo 64', description: '3D 64-bit console', price: 130, category: 'Console' },
    { title: 'Game Boy Advance', description: 'Advanced handheld console', price: 120, category: 'Handheld' },
    { title: 'Sega Game Gear', description: 'Handheld 8-bit console', price: 90, category: 'Handheld' },
    { title: 'Sony PlayStation 2', description: '2nd generation PlayStation console', price: 200, category: 'Console' }
  ];

  await Product.insertMany(products);
  console.log('Retro products seeded');

  process.exit();
}).catch(err => {
  console.error(err);
});
