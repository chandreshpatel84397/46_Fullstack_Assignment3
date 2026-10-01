// ============================================================
// Question 6: Call Free API from Frontend and Backend
// ============================================================

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3006;

// 1. Setup EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// BACKEND API CALL IMPLEMENTATION
// Useful Utility 1: Live Currency Converter via Node.js / Axios
// ============================================================
app.get('/api/currency-convert', async (req, res) => {
    try {
        const base = (req.query.base || 'USD').toUpperCase();
        const target = (req.query.target || 'INR').toUpperCase();
        const amount = parseFloat(req.query.amount) || 1;

        // Calling free, reliable public exchange rate API from Express Backend
        const apiUrl = `https://open.er-api.com/v6/latest/${base}`;
        const response = await axios.get(apiUrl, { timeout: 5000 });

        const rates = response.data.rates;
        if (!rates || !rates[target]) {
            return res.status(400).json({ error: `Currency rate for ${target} not found.` });
        }

        const rate = rates[target];
        const converted = (amount * rate).toFixed(2);

        res.json({
            success: true,
            provider: 'Open Exchange Rates (via Backend)',
            base,
            target,
            amount,
            rate,
            converted,
            lastUpdated: response.data.time_last_update_utc
        });
    } catch (err) {
        console.error('Backend API error:', err.message);
        res.status(500).json({ error: 'Failed to fetch currency data from external API: ' + err.message });
    }
});

// Render Main Page
app.get('/', (req, res) => {
    res.render('index');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Question 6 Server running at http://localhost:${PORT}`);
});
