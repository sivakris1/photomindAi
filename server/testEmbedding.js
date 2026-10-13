import { getTextEmbedding, calculateCosineSimilarity } from './services/aiEmbeddingService.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('\n🧠 Testing HuggingFace CLIP Embedding API...\n');
  console.log('API Key found:', process.env.HF_API_KEY ? '✅ Yes' : '❌ No key in .env');

  // Generate vectors for two similar phrases and one unrelated phrase
  const vectorDog   = await getTextEmbedding('golden retriever playing on green grass');
  const vectorPuppy = await getTextEmbedding('yellow puppy running in the park');
  const vectorCar   = await getTextEmbedding('red sports car on highway');

  console.log(`\n✅ Vector generated! Total dimensions: ${vectorDog.length}`);
  console.log('First 5 values:', vectorDog.slice(0, 5));

  // Compare similarity scores
  const dogVsPuppy = calculateCosineSimilarity(vectorDog, vectorPuppy);
  const dogVsCar   = calculateCosineSimilarity(vectorDog, vectorCar);

  console.log('\n📊 Cosine Similarity Results:');
  console.log(`🐕 "golden retriever on grass"  vs  "yellow puppy in park": ${(dogVsPuppy * 100).toFixed(2)}%`);
  console.log(`🚗 "golden retriever on grass"  vs  "red sports car":       ${(dogVsCar   * 100).toFixed(2)}%`);

  console.log('\n✅ If dog vs puppy score is HIGHER than dog vs car — CLIP is working correctly!\n');
}

test();
