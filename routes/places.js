import { Router } from 'express';
import { placesData } from '../data/index.js';
import validation from '../helpers/validation.js';
import xss from 'xss';

const router = Router();

// Route logging middleware
router.use((req, res, next) => {
  console.log(`[PLACES] ${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Root route redirect
router.route('/')
  .get(async (req, res) => {
    res.redirect('/places/browse');
  });

// Browse places with pagination
router.route('/browse')
  .get(async (req, res) => {
    try {
      const { page = 1 } = req.query;
      const limit = 10;
      
      const { places, total } = await placesData.getAllPlaces(parseInt(page), limit);
      const totalPages = Math.ceil(total / limit);

      res.render('places/browse', {
        places,
        user: req.session.user,
        title: 'Browse All Wellness Places',
        currentPage: parseInt(page),
        totalPages,
        hasPrev: parseInt(page) > 1,
        hasNext: parseInt(page) < totalPages
      });
    } catch (e) {
      const status = e.type === 'DatabaseError' ? 500 : 400;
      res.status(status).render('error', {
        errorType: e.type || 'Error',
        errorMessage: e.message,
        title: 'Error'
      });
    }
  });

// Search places
router.route('/search')
  .get(async (req, res) => {
    try {
      const { name, type, city, tags, minRating, sortBy, page = 1 } = req.query;
      const limit = 10;

      const searchParams = {
        name: name ? xss(name) : undefined,
        type: type ? xss(type) : undefined,
        city: city ? xss(city) : undefined,
        tags: tags ? tags.split(',').map(t => xss(t.trim())) : [],
        minRating: minRating ? parseFloat(xss(minRating)) : undefined,
        sortBy: sortBy ? xss(sortBy) : undefined,
        page: parseInt(page),
        limit
      };

      const { places, total } = await placesData.searchPlaces(searchParams);
      const totalPages = Math.ceil(total / limit);

      res.render('places/search', {
        title: 'Search Wellness Places',
        places: places.map(p => ({
          ...p,
          placeId: p._id.toString(),
          city: p.city || 'Unknown'
        })),
        user: req.session.user,
        searchParams: req.query,
        currentPage: parseInt(page),
        totalPages,
        hasPrev: parseInt(page) > 1,
        hasNext: parseInt(page) < totalPages,
        hasSearchCriteria: Boolean(name || type || city || tags || minRating || sortBy)
      });
    } catch (e) {
      const status = e.type === 'ValidationError' ? 400 : 500;
      res.status(status).render('error', {
        title: 'Search Error',
        errorType: e.type || 'Error',
        errorMessage: e.message
      });
    }
  });

// Get all tags
router.route('/tags')
  .get(async (req, res) => {
    try {
      const tags = await placesData.getAllTags();
      res.json(tags);
    } catch (e) {
      res.status(500).json({ 
        errorType: e.type || 'Error', 
        errorMessage: e.message 
      });
    }
  });

// Export places
router.route('/export')
  .get(async (req, res) => {
    try {
      const { name, type, city, tags, minRating, sortBy } = req.query;
      const searchParams = {
        name: name ? xss(name) : undefined,
        type: type ? xss(type) : undefined,
        city: city ? xss(city) : undefined,
        tags: tags ? xss(tags).split(',') : [],
        minRating: minRating ? parseFloat(xss(minRating)) : undefined,
        sortBy: sortBy ? xss(sortBy) : undefined,
        page: 1,
        limit: 100
      };

      const { places } = await placesData.searchPlaces(searchParams);
      
      res.setHeader('Content-Disposition', 'attachment; filename=places_export.json');
      res.setHeader('Content-Type', 'application/json');
      res.json(places);
    } catch (e) {
      const status = e.type === 'ValidationError' ? 400 : e.type === 'DatabaseError' ? 500 : 400;
      res.status(status).render('error', {
        errorType: e.type || 'Error',
        errorMessage: e.message,
        title: 'Error'
      });
    }
  });

// Get place by ID
router.route('/:id')
  .get(async (req, res) => {
    try {
      req.params.id = validation.checkId(xss(req.params.id), 'Place ID');
      const place = await placesData.getPlaceById(req.params.id);
      
      res.render('places/dashboard', {
        place,
        user: req.session.user,
        title: place.name
      });
    } catch (e) {
      const status = e.type === 'ValidationError' ? 400 : 
                    e.type === 'NotFoundError' ? 404 : 500;
      res.status(status).render('error', {
        errorType: e.type || 'Error',
        errorMessage: e.message,
        title: 'Error'
      });
    }
  });

export default router;