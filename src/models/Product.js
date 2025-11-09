// src/models/Product.js
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const productSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  code: String,
  price: { type: Number, required: true, default: 0 },
  status: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  category: String,
  thumbnails: [String]
}, { timestamps: true });

// pagination plugin
productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);
export default Product;
