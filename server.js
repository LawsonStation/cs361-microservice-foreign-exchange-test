const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = 5004;

// Middleware for JSON parsing
app.use(express.json());

// Middleware for CORS
const cors = require("cors");
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static("public"));

// Endpoint for currency conversion
app.post("/convert", async (req, res) => {
    const { amount, targetCurrency } = req.body;

    if (!amount || !targetCurrency) {
        return res.status(400).json({ error: "Missing required fields: amount, targetCurrency" });
    }

    try {
        // Fetch live exchange rates
        const response = await axios.get(process.env.EXCHANGE_API_URL, {
            params: {
                app_id: process.env.EXCHANGE_API_KEY,
            },
        });

        const rates = response.data.rates;
        const baseCurrency = response.data.base;

        if (!rates[targetCurrency]) {
            return res.status(400).json({ error: `Unsupported currency code: ${targetCurrency}` });
        }

        // Convert the amount
        const convertedValue = (amount / rates[baseCurrency]) * rates[targetCurrency];

        // Log requested data and response data
        console.log("Request data:", { amount, targetCurrency });
        console.log("Response data:", {
            originalAmount: amount,
            originalCurrency: baseCurrency,
            convertedAmount: convertedValue.toFixed(2),
            targetCurrency: targetCurrency,
        });
        
        res.json({
            originalAmount: amount,
            originalCurrency: baseCurrency,
            convertedAmount: convertedValue.toFixed(2),
            targetCurrency: targetCurrency,
        });
    } catch (error) {
        console.error("Error fetching exchange rates:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Currency Converter microservice running on http://localhost:${port}`);
});
