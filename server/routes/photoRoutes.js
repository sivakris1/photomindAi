import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import {
  uploadPhoto,
  getAllPhotos,
  deletePhoto
} from '../controllers/photoController.js';

const router = express.Router();

router.post('/upload', upload.single('image'), uploadPhoto);
router.get('/', getAllPhotos);
router.delete('/:id', deletePhoto);