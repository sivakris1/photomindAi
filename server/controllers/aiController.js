import Photo from "../models/Photo";
import {
  calculateCosineSimilarity,
  getTextEmbedding,
} from "../services/aiEmbeddingService";

/**
 * 1. Semantic Text Search
 * POST /api/ai/search
 * Body: { query: "dog in the grass", threshold: 0.15 }
 */

export const semanticSearch = async (req, res) => {
  try {
    const { query, threshold = 0.15 } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Search query text is required." });
    }

    console.log(`AI Searching for prompt: ${query}`);

    const queryEmbedding = await getTextEmbedding(query);

    const photos = await Photo.find();

    if (photos.length === 0) {
      return res.json({ query, totalResults: 0, results: [] });
    }

    const scoredPhotos = photos.map((photo) => {
        const similarity = calculateCosineSimilarity(queryEmbedding, photo.embedding);
        return {
          _id: photo._id,
          title: photo.title,
          url: photo.url,
          filename: photo.filename,
          createdAt: photo.createdAt,
          similarityScore: Number((similarity * 100).toFixed(2)) // score as percentage
        };
    }).filter((photo) => photo.similarity >= threshold * 100).sort((a,b) => b.similarityScore - a.similarityScore);

    console.log(` Found ${scoredPhotos.length} relevant photos.`);
    res.json({
      query,
      totalResults: scoredPhotos.length,
      results: scoredPhotos
    });
  } catch (error) {
    console.error('Semantic Search Error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
};