import Photo from "../models/Photo.js";
import {
  calculateCosineSimilarity,
  getTextEmbedding,
} from "../services/aiEmbeddingService.js";

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

    const cleanQuery = query.trim().toLowerCase();
    console.log(`🔍 Hybrid AI searching for: "${cleanQuery}"`);

    // Generate 512-dimension vector for the text prompt

    const queryEmbedding = await getTextEmbedding(cleanQuery);

    // Fetch all photos from MongoDB 
    const photos = await Photo.find();
    if (photos.length === 0) {
      return res.json({ query, totalResults: 0, results: [] });
    }
    // Extract meaningful words from search query (ignore words like 'a', 'the', 'in')

    const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'with', 'of', 'and', 'for', 'picture', 'photo', 'image']);
    const queryTokens = cleanQuery
      .split(/\s+/)
      .filter((word) => word.length > 1 && !stopWords.has(word));

    // Score each photo using Hybrid Fusion
    const scoredPhotos = photos
      .map((photo) => {
        // Visual CLIP Score (0 to 100) 
        const clipRaw = calculateCosineSimilarity(queryEmbedding, photo.embedding);
        const clipScore = Number((clipRaw * 100).toFixed(2));
        // Lexical OCR Score (0 to 100) 
        const ocrText = (photo.extractedText || '').toLowerCase();
        let ocrScore = 0;
        let matchedWords = [];
        if (ocrText && queryTokens.length > 0) {
          queryTokens.forEach((token) => {
            if (ocrText.includes(token)) {
              matchedWords.push(token);
            }
          });
          if (matchedWords.length > 0) {
            // Fraction of search keywords found in the image text
            ocrScore = (matchedWords.length / queryTokens.length) * 100;
          }
        }
        // Smart Hybrid Fusion 
        let finalScore = clipScore;
        let matchType = 'visual';
        if (ocrScore > 0) {
          // Both visual context AND exact printed text matched!
          // Give heavy weight to OCR keywords + CLIP context + 10% bonus boost
          finalScore = Math.min(100, Number((clipScore * 0.4 + ocrScore * 0.6 + 10).toFixed(2)));
          matchType = 'hybrid (visual + text)';
        }
        return {
          _id: photo._id,
          title: photo.title,
          url: photo.url,
          filename: photo.filename,
          extractedText: photo.extractedText ? photo.extractedText.slice(0, 120) + '...' : '',
          matchedWords: matchedWords,
          matchType: matchType,
          similarityScore: finalScore, // Used by the frontend badge
          clipScore: clipScore,        // For debugging/insights
          ocrScore: Number(ocrScore.toFixed(2))
        };
      })
      // Filter out low scores and sort highest match first
      .filter((photo) => photo.similarityScore >= threshold * 100)
      .sort((a, b) => b.similarityScore - a.similarityScore);
    console.log(`🎯 Found ${scoredPhotos.length} relevant photos.`);
    res.json({
      query,
      totalResults: scoredPhotos.length,
      results: scoredPhotos,
    });
  } 

catch (error) {
    console.error("Hybrid Search Error:", error);
    res.status(500).json({ error: "Search failed", details: error.message });
  }
};

export const findSimilarPhotos = async (req, res) => {
  try {
    const targetPhoto = await Photo.findById(req.params.id);

    if (!targetPhoto) {
      return res.status(404).json({ error: "Target photo not found" });
    }

    const otherPhotos = await Photo.find({ _id: { $ne: targetPhoto.id } });

    const similarPhotos = otherPhotos
      .map((photo) => {
        const similarity = calculateCosineSimilarity(
          targetPhoto.embedding,
          photo.embedding,
        );
        return {
          _id: photo._id,
          title: photo.title,
          url: photo.url,
          similarityScore: Number((similarity * 100).toFixed(2))
        };
      })
      .filter((photo) => photo.similarityScore > 20)
      .sort((a, b) => b.similarityScore - a.similarityScore);
    res.json({
      targetPhoto: {
        _id: targetPhoto._id,
        title: targetPhoto.title,
        url: targetPhoto.url,
      },
      similarCount: similarPhotos.length,
      results: similarPhotos,
    });
  } catch (error) {
    console.error("Similar Photos Error:", error);
    res.status(500).json( { error: "Failed to find similar photos" });
  }
};
