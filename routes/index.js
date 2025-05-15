// routes/index.js

import userRoutes from './users.js';
import placeRoutes from './places.js';
import addPlaceRoutes from './addplaces.js';



const constructorMethod = (app) => {
  app.use('/', userRoutes);
  
  app.use('/places', placeRoutes); 

  app.use('/manage-places', addPlaceRoutes);
  // Catch-all route for unmatched paths
  app.use(/(.*)/, (req, res) => {
    res.status(404).render('error', { error: 'Page not found' });
  });
};

export default constructorMethod;



