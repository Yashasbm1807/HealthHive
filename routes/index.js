// Import the route handlers for the '/places' path from the specified file.
import placesRoutes from './places.js';

// This function takes the Express application instance as an argument and configures the application's routes.
const constructorMethod = (app) => {
  // Define a route for the root path ('/').
  app.get('/', (req, res) => {
    // When a GET request is made to the root path, redirect the user to the '/places/browse' route.
    res.redirect('/places/browse');
  });
  // Mount the 'placesRoutes' middleware at the '/places' path. 
  app.use('/places', placesRoutes);
  // Define a catch-all route for any path that hasn't been defined previously ('*').
  app.use('*', (req, res) => {
    // For any undefined route, set the HTTP status code to 404 (Not Found) and render the 'error' view, 
    // passing an error message and a title.
    res.status(404).render('error', { error: 'Route Not Found', title: 'Error' });
  });
};
// Export the 'constructorMethod' function, which is responsible for setting up the application's routes. 
export default constructorMethod;