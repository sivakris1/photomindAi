import fs from 'fs'
import Photo from '../models/Photo'
import { getImageEmbedding } from '../services/aiEmbeddingService'

export const uploadPhoto = async(req, res) => {
    try {
        if (!req.file) {
      return res.status(400).json({ error: 'Please select an image file to upload.' });
    }

    console.log(`📸 Processing image: ${req.file.originalname}`);

    const embedding = await getImageEmbedding(req.file.path);

    const newPhoto = new Photo({
         title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      embedding: embedding
    })

    await newPhoto.save(); res.status(201).json({
      message: 'Photo uploaded and indexed with AI successfully!',
      photo: {
        _id: newPhoto._id,
        title: newPhoto.title,
        url: newPhoto.url,
        createdAt: newPhoto.createdAt
      }
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process photo', details: error.message });
  }
}