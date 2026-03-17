import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://praveen:T5l2kceT@cluster0.l9u16m5.mongodb.net/halleyx-dashboard';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Backend Server: MongoDB connected to Atlas'))
  .catch((err) => console.error('❌ Backend Server: MongoDB connection error:', err));

// Routes
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HalleyX Backend is running' });
});

app.listen(port, () => {
  console.log(`🚀 Dedicated Backend Server listening on port ${port}`);
});
