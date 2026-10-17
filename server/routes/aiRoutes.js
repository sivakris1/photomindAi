import express from 'express';
import {
  semanticSearch,
  findSimilarPhotos
} from '../controllers/aiController.js';

const router = express.Router();


router.post('/search', semanticSearch);

router.get('/similar/:id', findSimilarPhotos);

export default router;