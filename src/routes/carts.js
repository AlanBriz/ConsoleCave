// src/routes/carts.js
import { Router } from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = Router();

// Get all carts (testing)
router.get("/", async (req, res) => {
  try {
    const carts = await Cart.find().populate("products.product").lean();
    res.status(200).json(carts);
  } catch (err) {
    console.error("Error fetching carts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create cart
router.post("/", async (req, res) => {
  try {
    const cart = await Cart.create({ products: [] });
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get cart products populated
router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate("products.product")
      .lean();
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add product to cart (increments if it already exists)
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const prodObjId = req.params.pid;
    const existing = cart.products.find(
      (p) => p.product.toString() === prodObjId
    );
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: prodObjId, quantity: 1 });
    }
    await cart.save();
    const populated = await Cart.findById(cart._id)
      .populate("products.product")
      .lean();
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE api/carts/:cid/products/:pid -> remove product from cart
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send("Cart not found");

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== pid
    );

    await cart.save();
    res.redirect(`/carts/${cid}`);
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).send("Server error");
  }
});


// PUT api/carts/:cid -> replace cart products with array
router.put("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    // Validate product ids and quantities
    cart.products = (req.body.products || []).map((p) => ({
      product: p.product,
      quantity: p.quantity || 1,
    }));
    await cart.save();
    const popped = await Cart.findById(cart._id)
      .populate("products.product")
      .lean();
    res.json(popped);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT api/carts/:cid/products/:pid -> update ONLY quantity
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (typeof quantity !== "number")
      return res.status(400).json({ error: "Quantity must be number" });

    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.products.find(
      (p) => p.product.toString() === req.params.pid
    );
    if (!item) return res.status(404).json({ error: "Product not in cart" });

    item.quantity = quantity;
    await cart.save();
    const populated = await Cart.findById(cart._id)
      .populate("products.product")
      .lean();
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE api/carts/:cid -> remove all products from the cart
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send("Cart not found");

    cart.products = [];
    await cart.save();
    res.redirect(`/carts/${cid}`);
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).send("Server error");
  }
});


export default router;
