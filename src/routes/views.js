// src/routes/views.js
import { Router } from "express";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

const router = Router();

// Home Page
router.get("/", (req, res) => {
  res.render("home", { title: "Console Cave" });
});

// List products (web view)
router.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      lean: true,
    };
    if (sort === "asc") options.sort = { price: 1 };
    if (sort === "desc") options.sort = { price: -1 };

    let filter = {};
    if (query) {
      const colonIndex = query.indexOf(":");
      if (colonIndex > -1) {
        const key = query.slice(0, colonIndex);
        let val = query.slice(colonIndex + 1);
        if (key === "status") val = val === "true";
        filter[key] = val;
      } else {
        filter = {
          $or: [
            { title: new RegExp(query, "i") },
            { category: new RegExp(query, "i") },
          ],
        };
      }
    }

    const result = await Product.paginate(filter, options);
    const cartId = req.query.cartId || null;

    res.render("products/index", {
      products: result.docs,
      totalPages: result.totalPages,
      page: result.page,
      hasPrev: result.hasPrevPage,
      hasNext: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `/products?page=${result.prevPage}&limit=${limit}`
        : null,
      nextLink: result.hasNextPage
        ? `/products?page=${result.nextPage}&limit=${limit}`
        : null,
      limit,
      sort,
      query,
      cartId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// product detail
router.get('/products/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).send('Not found');

    const cartId = req.query.cartId || null;

    res.render('products/detail', { product, cartId });
  } catch (err) {
    res.status(500).send('Server error');
  }
});


// Redirect to the user's cart
router.get("/carts", (req, res) => {
  res.send(
    `<script>
      const cartId = localStorage.getItem('cartId');
      if (cartId) window.location.href = '/carts/' + cartId;
      else alert('You have no cart yet. Add a product first.');
    </script>`
  );
});

// Cart view
router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate("products.product")
      .lean();
    if (!cart) return res.status(404).send("Cart not found");
    res.render("carts/detail", { cart });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Add product to cart
router.post("/carts/add/:pid", async (req, res) => {
  try {
    const cartId = req.query.cartId;
    if (!cartId) return res.status(400).send("No cartId provided");

    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).send("Cart not found");

    const existing = cart.products.find(
      (p) => p.product.toString() === req.params.pid
    );
    if (existing) existing.quantity += 1;
    else cart.products.push({ product: req.params.pid, quantity: 1 });

    await cart.save();
    res.redirect("/products?cartId=" + cartId);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
