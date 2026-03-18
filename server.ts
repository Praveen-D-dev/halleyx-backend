import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/api.routes';

// Load .env relative to this file's location
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialise SQLite (creates tables if not present)
import './db/database';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HalleyX Backend is running (SQLite)' });
});

app.listen(port, () => {
  console.log(`🚀 Dedicated Backend Server listening on port ${port}`);
});
