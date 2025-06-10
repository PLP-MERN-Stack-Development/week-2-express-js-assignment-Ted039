// server.js - Advanced Express API for Task 5

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());

// Custom Middleware for Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Custom Middleware for Authentication (Basic Example)
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer secret-token') {
    return res.status(403).json({ message: 'Unauthorized access' });
  }
  next();
});

// Sample in-memory products database
let products = [
  { id: '1', name: 'Laptop', description: 'High-performance laptop with 16GB RAM', price: 1200, category: 'electronics', inStock: true },
  { id: '2', name: 'Smartphone', description: 'Latest model with 128GB storage', price: 800, category: 'electronics', inStock: true },
  { id: '3', name: 'Coffee Maker', description: 'Programmable coffee maker with timer', price: 50, category: 'kitchen', inStock: false },
  { id: '4', name: 'Headphones', description: 'Noise-canceling headphones', price: 200, category: 'electronics', inStock: true },
  { id: '5', name: 'Blender', description: 'High-speed blender for smoothies', price: 100, category: 'kitchen', inStock: true }
];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// GET /api/products - Get all products with filtering and pagination
app.get('/api/products', (req, res) => {
  let { category, page = 1, limit = 2 } = req.query;
  let filteredProducts = products;

  // Filter by category if provided
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Pagination logic
  page = parseInt(page);
  limit = parseInt(limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    total: filteredProducts.length,
    page,
    limit,
    products: paginatedProducts
  });
});

// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// POST /api/products - Create a new product
app.post('/api/products', (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  if (!name || !description || !price || !category || inStock === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const newProduct = { id: uuidv4(), name, description, price, category, inStock };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update a product
app.put('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  const { name, description, price, category, inStock } = req.body;
  products[productIndex] = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    description: description || products[productIndex].description,
    price: price || products[productIndex].price,
    category: category || products[productIndex].category,
    inStock: inStock !== undefined ? inStock : products[productIndex].inStock
  };
  res.json(products[productIndex]);
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  products.splice(productIndex, 1);
  res.status(204).send();
});

// GET /api/products/search - Search products by name
app.get('/api/products/search', (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ message: 'Please provide a name to search' });
  }
  const results = products.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
  res.json(results);
});

// GET /api/products/stats - Get product statistics (count by category)
app.get('/api/products/stats', (req, res) => {
  const stats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  res.json(stats);
});

// Custom Middleware for Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;
