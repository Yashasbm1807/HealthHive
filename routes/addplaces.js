// routes/addplaces.js
import { Router } from 'express';
import { createPlace, getAllPlaces, getPlaceById, updatePlace, deletePlace, getPlacesByUser } from '../data/addplaces.js';
import { loginMiddleware, ensureAuthenticated } from '../middleware.js';
import { ObjectId } from 'mongodb';
import { viewUserPlaces} from '../controllers/placeController.js';
import { addPlacesData } from '../data/index.js'; 

const router = Router();


// routes/addplaces.js


router.get('/', loginMiddleware, async (req, res) => {
  try {
    console.log('Session user:', req.session.user); // Debug log
    const userId = req.session.user._id;
    console.log('User ID:', userId); // Debug log
    
    const userPlaces = await getPlacesByUser(userId);
    console.log('Found places:', userPlaces); // Debug log
    
    res.render('manage-places', {
      title: 'Your Places',
      places: userPlaces,
      user: req.session.user
    });
  } catch (e) {
    console.error('Error in /manage-places:', e); // Detailed error log
    res.status(500).render('error', {
      error: 'Failed to load your places',
      details: e.message
    });
  }
});

router.get('/add', loginMiddleware, (req, res) => {
  res.render('addplaces/add', {
    title: 'Add New Place',
    user: req.session.user,
    formData: {}
  });
});

router.post('/add', loginMiddleware, async (req, res) => {
  const { name, type, servicesOffered, address, city, description, tags } = req.body;
  const formData = { name, type, servicesOffered, address, city, description, tags };

  try {
    if (!name || !type || !servicesOffered || !address || !city || !description || !tags) {
      throw new Error('All fields are required');
    }

    const newPlace = await createPlace(
      name,
      type,
      servicesOffered.split(',').map(s => s.trim()),
      address,
      city,
      description,
      tags.split(',').map(t => t.trim()),
      req.session.user._id
    );

    return res.redirect(`/places/${newPlace._id}`);
  } catch (e) {
    return res.status(400).render('addplaces/add', {
      title: 'Add New Place',
      error: e.message,
      formData, 
      user: req.session.user
    });
  }
});


router.get('/:id/edit', loginMiddleware, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      throw new Error('Invalid place ID format');
    }

    const place = await getPlaceById(req.params.id);
    
    if (place.addedBy.toString() !== req.session.user._id.toString()) {
      throw new Error('You can only edit places you created');
    }

    res.render('addplaces/edit', {
      title: `Edit ${place.name}`,
      place: {
        ...place,
        servicesOffered: Array.isArray(place.servicesOffered) ? place.servicesOffered.join(', ') : place.servicesOffered,
        tags: Array.isArray(place.tags) ? place.tags.join(', ') : place.tags
      },
      user: req.session.user
    });
  } catch (e) {
    res.status(403).render('error', {
      error: 'Cannot edit place',
      details: e.message
    });
  }
});

router.put('/:id', loginMiddleware, async (req, res) => {
  try {
    const updatedPlace = await updatePlace(
      req.params.id,
      req.session.user._id,
      req.body
    );
    req.session.success = 'Place updated successfully';
    return res.redirect(`/places/${updatedPlace._id}`);
  } catch (e) {
    try {
      const originalPlace = await getPlaceById(req.params.id);
      return res.status(400).render('manage-places/edit', {
        title: 'Edit Place',
        error: e.message.includes('duplicate key') 
          ? 'A place with this name already exists in this city'
          : e.message,
        place: {
          ...originalPlace,
          servicesOffered: Array.isArray(originalPlace.servicesOffered) 
            ? originalPlace.servicesOffered.join(', ')
            : originalPlace.servicesOffered,
          tags: Array.isArray(originalPlace.tags)
            ? originalPlace.tags.join(', ')
            : originalPlace.tags,
          ...req.body
        },
        user: req.session.user
      });
    } catch (err) {
      return res.status(500).render('error', {
        error: 'Failed to process your request'
      });
    }
  }
});

router.delete('/:id', loginMiddleware, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      throw new Error('Invalid place ID format');
    }

    await deletePlace(req.params.id, req.session.user._id);
    req.session.success = 'Place deleted successfully';
    return res.redirect('/manage-places');
  } catch (e) {
    req.session.error = e.message;
    return res.redirect(`/places/${req.params.id}`);
  }
});

router.get('/:id', async (req, res) => {
  const placeId = req.params.id;
  try {
    if (!ObjectId.isValid(placeId)) {
      return res.status(400).render('error', {
        error: 'Invalid place ID format'
      });
    }

    const place = await getPlaceById(placeId);
    place._id = place._id.toString();
    return res.render('addplaces/detail', {
      title: place.name,
      place,
      user: req.session.user,
      success: req.session.success,
      error: req.session.error
    });
  } catch (e) {
    return res.status(404).render('error', {
      error: 'Place not found',
      details: e.message
    });
  }
});


export default router;