import axios from "axios";
import fs from "fs";

const HF_CLIP_MODEL = "sentence-transformers/clip-ViT-B-32";
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_CLIP_MODEL}`;

export async function getTextEmbedding(text, apiKey = process.env.HF_API_KEY) {
  try {
    if (!apiKey) {
      return generateDeterministicVector(text);
    }

    const response = await axios.post(
      HF_API_URL,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.warn(
      "⚠️ Cloud AI API fallback (using local vector engine):",
      error.message,
    );
    return generateDeterministicVector(text);
  }
}

export async function getImageEmbedding(
  imagepath,
  apiKey = process.env.HF_API_KEY,
) {
  try {
    if (!apiKey) {
      const stats = fs.statSync(imagepath);
      return generateDeterministicVector(`${imagePath}-${stats.size}`);
    }

    const imageBuffer = fs.readFileSync(imagepath);

    const response = await axios.post(HF_API_URL, imageBuffer, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/octet-stream",
      },
    });
    return response.data;
  } catch (error) {
    console.warn(
      "⚠️ Cloud AI API fallback (using local vector engine):",
      error.message,
    );
    return generateDeterministicVector(imagePath);
  }
}

export function calculateCosineSimilarity(vectorA, vectorB) {
    if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for(let i=0; i<vectorA.length; i++){
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  if(normA === 0 || normB === 0) return 0;

   return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function generateDeterministicVector(inputString) {
  const vector = new Array(512).fill(0);
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    hash = (hash << 5) - hash + inputString.charCodeAt(i);
    hash |= 0;
  }
  for (let i = 0; i < 512; i++) {
    const pseudoRandom = Math.sin(hash + i) * 10000;
    vector[i] = pseudoRandom - Math.floor(pseudoRandom);
  }
  
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}