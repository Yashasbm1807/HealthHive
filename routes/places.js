// Import the Router class from the Express library to create route handlers.
import { Router } from 'express';
// Import the 'placesData' object, which contains functions for interacting with place data.
import { placesData } from '../data/index.js';
// Import the 'validation' object, which contains functions for validating input.
import validation from '../helpers/validation.js';
// Import the 'xss' function to sanitize user input and prevent cross-site scripting attacks.
import xss from 'xss';
// Create a new router instance.
const router = Router();
// Define a route for the root path ('/').
router.route('/')
  .get(async (req, res) => {
    // When a GET request is made to the root path, redirect the user to the '/places/browse' route.
    res.redirect('/places/browse');
  });
// Define a route for '/browse'.
router.route('/browse')
  .get(async (req, res) => {
    try {
      // Extract the 'page' query parameter from the request, defaulting to 1 if not provided.
      const { page = 1 } = req.query;
      const limit = 10; // Define the number of places to display per page.
      // Call the 'getAllPlaces' function from 'placesData' to retrieve a paginated list of places and the total number of places.
      const { places, total } = await placesData.getAllPlaces(parseInt(page), limit);
      // Calculate the total number of pages based on the total number of places and the limit per page.
      const totalPages = Math.ceil(total / limit);
      // Render the 'places/browse' view, passing data such as the list of places, the title, 
      // the current page, total pages, and boolean flags for previous and next page availability.
      res.render('places/browse', {
        places,
        title: 'Browse All Wellness Places',
        currentPage: parseInt(page),
        totalPages,
        hasPrev: parseInt(page) > 1, // True if the current page is greater than 1 (previous page exists).
        hasNext: parseInt(page) < totalPages // True if the current page is less than the total number of pages (next page exists).
      });
    } catch (e) {
      // Handle any errors that occur during the process.
      // Set the HTTP status code based on the error type (500 for database errors, 400 for others).
      const status = e.type === 'DatabaseError' ? 500 : 400; 
      // Render the 'error' view, passing error information such as the error type and message, and a title.
      res.status(status).render('error', { 
        errorType: e.type || 'Error', 
        errorMessage: e.message, 
        title: 'Error' 
      });
    }
  });
// Define a route for '/search'.
router.route('/search')
  .get(async (req, res) => {
    try {
      // Extract various query parameters from the request, representing search criteria and pagination.
      const { name, type, city, tags, minRating, sortBy, page = 1 } = req.query;
      // Define the number of search results to display per page.
      const limit = 10;
      // Initialize variables to store the search results and the total number of results.
      let placeList = [], total = 0;
      // Check if any search criteria have been provided.
      let hasSearchCriteria = name || type || city || tags || minRating || sortBy;
      // If there are any search criteria, call the 'searchPlaces' function from 'placesData'.
      if (hasSearchCriteria) {
        const searchParams = {
          name: name ? xss(name.trim()) : undefined, // Sanitize and trim the 'name' parameter.
          type: type ? xss(type.trim()) : undefined, // Sanitize and trim the 'type' parameter.
          city: city ? xss(city.trim()) : undefined, // Sanitize and trim the 'city' parameter.
          tags: tags ? xss(tags).split(',').map(t => t.trim()) : [], // Sanitize the 'tags' parameter, split it into an array, trim each tag, and use an empty array as default.
          minRating: minRating ? parseFloat(xss(minRating)) : undefined, // Sanitize and parse the 'minRating' parameter as a float.
          sortBy: sortBy ? xss(sortBy) : undefined, // Sanitize the 'sortBy' parameter.
          page: parseInt(page), // Parse the 'page' parameter as an integer.
          limit // Use the defined limit for pagination.
        };
        // Call the 'searchPlaces' function and retrieve the list of places and the total number of results.        
        ({ places: placeList, total } = await placesData.searchPlaces(searchParams));
      }
      // Calculate the total number of pages for the search results.
      const totalPages = Math.ceil(total / limit);
      // Render the 'places/search' view, passing the search results, title, search parameters, 
      // current page, total pages, and flags for previous/next page and the presence of search criteria.
      res.render('places/search', {
        places: placeList,
        title: 'Search Wellness Places',
        searchParams: req.query,
        currentPage: parseInt(page),
        totalPages,
        hasPrev: parseInt(page) > 1,
        hasNext: parseInt(page) < totalPages,
        hasSearchCriteria
      });
    } catch (e) {
      // Handle any errors that occur during the search process.
      const status = e.type === 'ValidationError' ? 400 : e.type === 'DatabaseError' ? 500 : 400;
      // Render the 'places/search' view with an empty place list and error information.
      res.status(status).render('places/search', { 
        places: [],
        title: 'Search Wellness Places',
        searchParams: req.query,
        errorType: e.type || 'Error',
        errorMessage: e.message,
        currentPage: parseInt(req.query.page || 1),
        totalPages: 0,
        hasSearchCriteria: true
      });
    }
  });
// Define a route for '/tags'.
router.route('/tags')
  .get(async (req, res) => {
    try {
      // Call the 'getAllTags' function from 'placesData' to retrieve all unique tags.
      const tags = await placesData.getAllTags();
      // Respond with a JSON object containing the array of tags.
      res.json(tags);
    } catch (e) {
      // Handle any errors that occur while fetching tags.
      // Respond with a 500 status code and a JSON error object.
      res.status(500).json({ errorType: e.type || 'Error', errorMessage: e.message }); 
    }
  });
// Define a route for '/export'.
router.route('/export')
  .get(async (req, res) => {
    try {
      // Extract search parameters from the request query for exporting.
      const { name, type, city, tags, minRating, sortBy } = req.query;
      const searchParams = {
        name: name ? xss(name) : undefined, // Sanitize the 'name' parameter.
        type: type ? xss(type) : undefined, // Sanitize the 'type' parameter.
        city: city ? xss(city) : undefined, // Sanitize the 'city' parameter.
        tags: tags ? xss(tags).split(',') : [], // Sanitize and split the 'tags' parameter.
        minRating: minRating ? parseFloat(xss(minRating)) : undefined, // Sanitize and parse the 'minRating' parameter.
        sortBy: sortBy ? xss(sortBy) : undefined, // Sanitize the 'sortBy' parameter.
        page: 1, // Set the page to 1 to get all results.
        limit: 100 // Set a high limit to retrieve a large number of results for export.
      };
      // Call 'searchPlaces' with the export parameters to get the matching places.
      const { places } = await placesData.searchPlaces(searchParams);
      // Set the HTTP headers to indicate that the response is a JSON file to be downloaded.
      res.setHeader('Content-Disposition', 'attachment; filename=places_export.json');
      res.setHeader('Content-Type', 'application/json');
      // Send the list of places as a JSON response.
      res.json(places);
    } catch (e) {
      // Handle any errors that occur during the export process.
      // Set the HTTP status code based on the error type.
      const status = e.type === 'ValidationError' ? 400 : e.type === 'DatabaseError' ? 500 : 400;
      // Render the 'error' view with error information.
      res.status(status).render('error', { 
        errorType: e.type || 'Error', 
        errorMessage: e.message, 
        title: 'Error' 
      });
    }
  });
// Define a route for a specific place ID ('/:id').
router.route('/:id')
  .get(async (req, res) => {
    try {
      // Sanitize and validate the 'id' parameter from the request.
      req.params.id = validation.checkId(xss(req.params.id), 'Place ID');
      // Call 'getPlaceById' from 'placesData' to retrieve the place with the given ID.
      const place = await placesData.getPlaceById(req.params.id);
      // Render the 'places/dashboard' view, passing the retrieved place data and setting the title to the place's name.
      res.render('places/dashboard', { place, title: place.name });
    } catch (e) {
      // Handle errors that occur while retrieving a specific place.
      // Set the HTTP status code based on the error type.
      const status = e.type === 'ValidationError' ? 400 : e.type === 'NotFoundError' ? 404 : 500;
      // Render the 'error' view with error information.
      res.status(status).render('error', { 
        errorType: e.type || 'Error', 
        errorMessage: e.message, 
        title: 'Error' 
      });
    }
  });
// Export the router instance, making these routes available to the main Express application.
export default router;