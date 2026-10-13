// import axios from "axios";
// import fs from "fs";

// const HF_CLIP_MODEL = "sentence-transformers/clip-ViT-B-32";
// const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_CLIP_MODEL}`; 

// export async function getTextEmbedding(text, apiKey = process.env.HF_API_KEY) {
//   try {
//     if (!apiKey) {
//       return generateDeterministicVector(text);
//     }

//     const response = await axios.post(
//       HF_API_URL,
//       { inputs: text },
//       {
//         headers: {
//           Authorization: `Bearer ${apiKey}`,
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     return response.data;
//   } catch (error) {
//     console.warn(
//       "⚠️ Cloud AI API fallback (using local vector engine):",
//       error.message,
//     );
//     return generateDeterministicVector(text);
//   }
// }

// export async function getImageEmbedding(
//   imagepath,
//   apiKey = process.env.HF_API_KEY,
// ) {
//   try {
//     if (!apiKey) {
//       const stats = fs.statSync(imagepath);
//       return generateDeterministicVector(`${imagePath}-${stats.size}`);
//     }

//     const imageBuffer = fs.readFileSync(imagepath);

//     const response = await axios.post(HF_API_URL, imageBuffer, {
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         "Content-Type": "application/octet-stream",
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.warn(
//       "⚠️ Cloud AI API fallback (using local vector engine):",
//       error.message,
//     );
//     return generateDeterministicVector(imagePath);
//   }
// }

// export function calculateCosineSimilarity(vectorA, vectorB) {
//     if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
//     return 0;
//   }

//   let dotProduct = 0;
//   let normA = 0;
//   let normB = 0;

//   for(let i=0; i<vectorA.length; i++){
//     dotProduct += vectorA[i] * vectorB[i];
//     normA += vectorA[i] * vectorA[i];
//     normB += vectorB[i] * vectorB[i];
//   }

//   if(normA === 0 || normB === 0) return 0;

//    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
// }

// function generateDeterministicVector(inputString) {
//   const vector = new Array(512).fill(0);
//   let hash = 0;
//   for (let i = 0; i < inputString.length; i++) {
//     hash = (hash << 5) - hash + inputString.charCodeAt(i);
//     hash |= 0;
//   }
//   for (let i = 0; i < 512; i++) {
//     const pseudoRandom = Math.sin(hash + i) * 10000;
//     vector[i] = pseudoRandom - Math.floor(pseudoRandom);
//   }
  
//   const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
//   return vector.map(val => val / magnitude);
// }
import {
  AutoTokenizer,
  AutoProcessor,
  CLIPTextModelWithProjection,
  CLIPVisionModelWithProjection,
  RawImage
} from '@xenova/transformers';

const MODEL_NAME = 'Xenova/clip-vit-base-patch32';

// Separate loaders for Text and Vision encoders
let tokenizer = null;
let textModel = null;
let processor = null;
let visionModel = null;

// Load CLIP Text Encoder (once, then cached)
async function loadTextModel() {
  if (!tokenizer || !textModel) {
    console.log('⏳ Loading CLIP Text Encoder...');
    tokenizer = await AutoTokenizer.from_pretrained(MODEL_NAME);
    textModel = await CLIPTextModelWithProjection.from_pretrained(MODEL_NAME);
    console.log('✅ CLIP Text Encoder loaded!');
  }
}

// Load CLIP Vision Encoder (once, then cached)
async function loadVisionModel() {
  if (!processor || !visionModel) {
    console.log('⏳ Loading CLIP Vision Encoder...');
    processor = await AutoProcessor.from_pretrained(MODEL_NAME);
    visionModel = await CLIPVisionModelWithProjection.from_pretrained(MODEL_NAME);
    console.log('✅ CLIP Vision Encoder loaded!');
  }
}

/**
 * 1. Convert Text Query → 512-Dimensional Vector
 * Example: "golden dog on grass" → [0.24, -0.87, 0.51, ...]
 */
export async function getTextEmbedding(text) {
  await loadTextModel();

  const text_inputs = tokenizer(text, { padding: true, truncation: true });
  const { text_embeds } = await textModel(text_inputs);

  return Array.from(text_embeds.data);
}

/**
 * 2. Convert Image File → 512-Dimensional Vector
 * Example: "uploads/dog.jpg" → [0.23, -0.85, 0.49, ...]
 */
export async function getImageEmbedding(imagePath) {
  await loadVisionModel();

  const image = await RawImage.fromURL(imagePath);
  const image_inputs = await processor(image);
  const { image_embeds } = await visionModel(image_inputs);

  return Array.from(image_embeds.data);
}

/**
 * 3. Cosine Similarity between 2 vectors
 * Returns: 1.0 (exact match) → 0.0 (completely unrelated)
 */
export function calculateCosineSimilarity(vectorA, vectorB) {
  if (!vectorA || !vectorB || vectorA.length !== vectorB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
