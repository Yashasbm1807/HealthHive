// controllers/placeController.js
import { addPlacesData } from '../data/index.js';

export const viewUserPlaces = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user._id;
    const userPlaces = await addPlacesData.getPlacesByUser(userId);

    res.render('manage-places', {
      title: 'Your Places',
      places: userPlaces,
      user: req.session.user
    });
  } catch (e) {
    res.status(500).render('error', {
      error: 'Failed to load your places',
      details: e.message
    });
  }
};