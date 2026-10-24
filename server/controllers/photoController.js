import fs from "fs";
import Photo from "../models/Photo.js";
import { getImageEmbedding, getTextEmbedding } from "../services/aiEmbeddingService.js";
import { extractTextFromImage } from "../services/ocrService.js"; 

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Please select an image file to upload." });
    }

    console.log(`📸 Processing image: ${req.file.originalname}`);

    const [embedding, extractedText] = await Promise.all([
      getImageEmbedding(req.file.path),
      extractTextFromImage(req.file.path)
    ]);

    const newPhoto = new Photo({
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      embedding: embedding,
      extractedText : extractedText
    });

    await newPhoto.save();
    res.status(201).json({
      message: "Photo uploaded and indexed with AI successfully!",
      photo: {
        _id: newPhoto._id,
        title: newPhoto.title,
        url: newPhoto.url,
        createdAt: newPhoto.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res
      .status(500)
      .json({ error: "Failed to process photo", details: error.message });
  }
};


export const getAllPhotos = async(req,res) =>{
    try {
        const photos = await Photo.find().select('-embedding').sort({ createdAt : -1});
        res.json({photos})
    } catch (error) {
          console.error('Fetch Photos Error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
    }
}

export const deletePhoto = async(req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if(!photo){
             return res.status(404).json({ error: 'Photo not found' });
        }

          if (fs.existsSync(photo.filepath)) {
      fs.unlinkSync(photo.filepath);
    }

       await Photo.findByIdAndDelete(req.params.id);
     res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete Photo Error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
}