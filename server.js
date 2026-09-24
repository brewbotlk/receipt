require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');

const receiptRoutes = require('./routes/receiptRoutes');

const app = express();

// ============================================================
// DATABASE
// ============================================================

connectDB();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({extended: true}));

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'BrewBot Receipt Backend is running.',
        environment: process.env.NODE_ENV || 'development',
    });
});

// ============================================================
// RECEIPT API
// ============================================================

app.use('/api/receipts', receiptRoutes);

// ============================================================
// RECEIPT WEB PAGE
// ============================================================

app.get('/receipt/:token', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'receipt.html'),
    );
});

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found.',
    });
});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((error, req, res, next) => {
    console.error('SERVER ERROR:', error);

    res.status(500).json({
        success: false,
        message: 'Internal server error.',
    });
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log('========================================');
    console.log('BREWBOT RECEIPT BACKEND');
    console.log('========================================');
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('========================================');
});