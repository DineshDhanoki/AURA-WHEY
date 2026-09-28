import { deleteOwnedReview } from '../_lib/review-interactions.js';
import { ReviewError } from '../_lib/reviews.js';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  try {
    if (request.method !== 'DELETE') { response.setHeader('Allow', 'DELETE'); return response.status(405).json({ message: 'Method not allowed.' }); }
    return response.status(200).json(await deleteOwnedReview(request, request.query?.reviewId));
  } catch (error) {
    return response.status(error instanceof ReviewError ? error.status : 502).json({ message: error instanceof ReviewError ? error.message : 'Reviews are temporarily unavailable.' });
  }
}
