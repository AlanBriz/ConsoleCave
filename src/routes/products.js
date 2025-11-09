// src/routes/products.js
import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

/*
 * GET /api/products
 * Query params:
 *  - limit (default 10)
 *  - page (default 1)
 *  - sort (asc or desc on price)
 *  - query (either category:<value> or status:true/false or plain value to search in title or category)
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      lean: true
    };

    if (sort === 'asc') options.sort = { price: 1 };
    else if (sort === 'desc') options.sort = { price: -1 };

    // build filter
    let filter = {};
    if (query) {
      const colonIndex = query.indexOf(':');
      if (colonIndex > -1) {
        const key = query.slice(0, colonIndex);
        let val = query.slice(colonIndex + 1);
        if (key === 'status') val = val === 'true';
        filter[key] = val;
      } else {
        // fallback search in title or category
        filter = { $or: [{ title: new RegExp(query, 'i') }, { category: new RegExp(query, 'i') }] };
      }
    }

    const result = await Product.paginate(filter, options);

    // Build prev/next links
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`.replace(/\/+$/, ''); // e.g. http://localhost:8080/api/products
    const makeLink = (p) => `${baseUrl}?page=${p}&limit=${options.limit}${query ? `&query=${encodeURIComponent(query)}` : ''}${sort ? `&sort=${sort}` : ''}`;

    const response = {
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.hasPrevPage ? result.prevPage : null,
      nextPage: result.hasNextPage ? result.nextPage : null,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? makeLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? makeLink(result.nextPage) : null
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// The rest endpoints (GET by id, POST, PUT, DELETE) should still exist but use Product model:
router.get('/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    // if you want to notify sockets:
    const io = req.app.get('io');
    if (io) {
      const docs = await Product.find().lean();
      io.emit('updateProducts', docs);
    }
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    if (!updated) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.pid);
    if (!deleted) return res.status(404).json({ status: 'error', message: 'Not found' });
    const io = req.app.get('io');
    if (io) {
      const docs = await Product.find().lean();
      io.emit('updateProducts', docs);
    }
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

export default router;
