import { Router } from 'express';
import statisticsRouter from './statistics.js';

const router = Router();

// Mount statistics routes
router.use('/statistics', statisticsRouter);

// Redirect root to statistics
router.get('/', (req, res) => {
  res.redirect('/statistics');
});

export default router;