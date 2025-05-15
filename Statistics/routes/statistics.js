import { Router } from 'express';
import statisticsData from '../data/statistics.js';

const router = Router();

// Statistics route
router.get('/', async (req, res) => {
  try {
    const stats = await statisticsData.getStatistics();
    res.render('statistics', {
      title: 'Health Hive Statistics',
      stats
    });
  } catch (e) {
    res.status(500).render('err', {
      title: 'Statistics Error',
      errorMessage: e.message || 'Unable to fetch statistics'
    });
  }
});

export default router;