// src/models/Cart.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const cartProductSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 }
});

const cartSchema = new Schema({
  products: [cartProductSchema]
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
