// ============================================================
// Question 7: MERN Shopping Cart with Admin & User Sites
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const Category = require('./models/Category');
const Product = require('./models/Product');

const app = express();
const PORT = 3007;
const MONGO_URI = 'mongodb://127.0.0.1:27017/shopping_cart_db';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve built React client if exists
const clientDist = path.join(__dirname, 'client/dist');
app.use(express.static(clientDist));

// Connect to MongoDB & Seed Sample Data
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('>>> Connected to MongoDB (shopping_cart_db)');
        await seedDefaultData();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Auto-seed default 2-level categories and products
async function seedDefaultData() {
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
        console.log('>>> Seeding default 2-Level Categories & Products...');
        // Level 1: Parent Categories
        const electronics = await Category.create({ name: 'Electronics', level: 1, parent: null });
        const fashion = await Category.create({ name: 'Fashion & Clothing', level: 1, parent: null });

        // Level 2: Subcategories
        const laptops = await Category.create({ name: 'Laptops & Computers', level: 2, parent: electronics._id });
        const mobiles = await Category.create({ name: 'Smartphones', level: 2, parent: electronics._id });
        const menWear = await Category.create({ name: 'Men Clothing', level: 2, parent: fashion._id });
        const womenWear = await Category.create({ name: 'Women Clothing', level: 2, parent: fashion._id });

        // Seed Sample Products
        await Product.create([
            {
                name: 'Apple MacBook Air M2',
                price: 999,
                description: '13-inch liquid retina display, 8GB RAM, 256GB SSD',
                stock: 15,
                category: electronics._id,
                subcategory: laptops._id
            },
            {
                name: 'Dell XPS 13 Laptop',
                price: 899,
                description: 'Intel Core i7, 16GB RAM, 512GB SSD',
                stock: 10,
                category: electronics._id,
                subcategory: laptops._id
            },
            {
                name: 'Apple iPhone 15',
                price: 799,
                description: '128GB Storage, Dynamic Island, A16 Bionic Chip',
                stock: 25,
                category: electronics._id,
                subcategory: mobiles._id
            },
            {
                name: 'Samsung Galaxy S24',
                price: 749,
                description: '8GB RAM, 128GB ROM, AI Camera',
                stock: 20,
                category: electronics._id,
                subcategory: mobiles._id
            },
            {
                name: 'Men Slim Fit Denim Shirt',
                price: 45,
                description: '100% Cotton, Casual wear',
                stock: 50,
                category: fashion._id,
                subcategory: menWear._id
            },
            {
                name: 'Women Floral Summer Dress',
                price: 55,
                description: 'Elegant casual dress with breathable fabric',
                stock: 40,
                category: fashion._id,
                subcategory: womenWear._id
            }
        ]);
        console.log('>>> Sample 2-level categories and products seeded successfully.');
    }
}

// ============================================================
// API ROUTES: Categories (2-Level)
// ============================================================

// Get all categories (with populated parent)
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().populate('parent');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Category (Parent or Subcategory)
app.post('/api/categories', async (req, res) => {
    try {
        const { name, parent } = req.body;
        if (!name) return res.status(400).json({ error: 'Category name is required' });

        const isSub = Boolean(parent);
        const category = new Category({
            name,
            parent: isSub ? parent : null,
            level: isSub ? 2 : 1
        });

        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Category
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const catId = req.params.id;
        // Delete child subcategories if parent is deleted
        await Category.deleteMany({ parent: catId });
        await Category.findByIdAndDelete(catId);
        res.json({ message: 'Category and associated subcategories deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// API ROUTES: Products
// ============================================================

// Get all products (with optional category and subcategory filtering)
app.get('/api/products', async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.subcategory) filter.subcategory = req.query.subcategory;

        const products = await Product.find(filter)
            .populate('category')
            .populate('subcategory')
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Product
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, description, stock, category, subcategory } = req.body;
        if (!name || !price || !category || !subcategory) {
            return res.status(400).json({ error: 'Name, price, category, and subcategory are required.' });
        }

        const product = new Product({
            name,
            price: Number(price),
            description: description || '',
            stock: Number(stock) || 10,
            category,
            subcategory
        });

        await product.save();
        const populated = await Product.findById(product._id).populate('category').populate('subcategory');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Simple Checkout / Order endpoint
app.post('/api/checkout', (req, res) => {
    const { items, total } = req.body;
    const orderId = 'ORD-' + Date.now();
    res.json({
        success: true,
        orderId,
        message: `Order #${orderId} placed successfully for $${total}!`,
        itemsCount: items ? items.length : 0
    });
});

// Fallback SPA routing
app.get('*', (req, res) => {
    const indexPath = path.join(clientDist, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.send('API running on port ' + PORT + '. Build client with `npm run build:client`');
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Question 7 Server running at http://localhost:${PORT}`);
});
