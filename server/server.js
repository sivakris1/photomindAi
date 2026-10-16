import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

import Photo from './models/Photo';
import upload from './middleware/uploadMiddleware';
import {
  getImageEmbedding,
  getTextEmbedding,
  calculateCosineSimilarity
} from './services/aiEmbeddingService.js';

import photoRoutes from './routes/photoRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.resolve('uploads')));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'PhotoMind AI Backend is up and running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/photos', photoRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photomind';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.warn('MongoDB connection warning:', err.message));

// Start Server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
