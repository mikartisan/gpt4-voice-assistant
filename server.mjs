import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/proxy', async (req, res) => {
    const query = req.query.query;
    const apiUrl = `https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Log the data to check the structure
        console.log('API Response:', data);

        res.json(data);
    } catch (error) {
        console.error('Error fetching from API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
