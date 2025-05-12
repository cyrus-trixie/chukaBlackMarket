import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer storage configuration for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chuka_black_market_images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    },
});

// Initialize multer with Cloudinary storage settings
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD, // Access password from environment variable
    database: process.env.DB_NAME || 'chuka_black_market',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
});

// Test database connection
app.get('/api/test', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        res.json({ message: 'Database connection successful' });
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// API Routes for Products
// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create a new product with image upload
app.post('/api/products', upload.single('image'), async (req, res) => {
    const { title, description, price, category, location, phone_number } = req.body;
    const image_url = req.file ? req.file.path : null;

    if (!title || !description || !price || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO products (title, description, price, category, location, image_url, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, price, category, location, image_url, phone_number]
        );

        res.status(201).json({
            message: 'Product created successfully',
            product: {
                title,
                description,
                price,
                category,
                location,
                image_url,
                phone_number,
            },
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update a product
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    const { title, description, price, category, location, phone_number } = req.body;
    const image_url = req.file ? req.file.path : null;

    try {
        const [result] = await pool.query(
            'UPDATE products SET title = ?, description = ?, price = ?, category = ?, location = ?, image_url = ?, phone_number = ? WHERE id = ?',
            [title, description, price, category, location, image_url, phone_number, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
//mfdfkd

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;