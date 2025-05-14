// Import the Express.js framework for building the web application.
import express from 'express';
// Import the function responsible for configuring all the application's routes.
import configRoutes from './routes/index.js';
// Import the 'fileURLToPath' function to work with file paths in ES modules.
import { fileURLToPath } from 'url';
// Import the 'dirname' function to extract the directory name from a path.
import { dirname } from 'path';
// Import the 'express-handlebars' middleware for using Handlebars as the template engine.
import exphbs from 'express-handlebars';

// Get the absolute file path of the current module.
const __filename = fileURLToPath(import.meta.url);
// Get the directory name of the current module's file path. This will be used to construct paths relative to the application root.
const __dirname = dirname(__filename);
// Create an instance of the Express application.
const app = express();
// Serve static files (like CSS, JavaScript, images) from the 'public' directory.
const staticDir = express.static(__dirname + '/public');

// Create a Handlebars instance with custom configurations.
const handlebarsInstance = exphbs.create({
  defaultLayout: 'main', // Set the default layout template to 'main.handlebars'.
  helpers: {
    // Define custom helper functions that can be used within Handlebars templates.
    asJSON: (obj, spacing) => {
      // Helper to stringify a JavaScript object into JSON format, with optional indentation for readability.
      if (typeof spacing === 'number') return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
      return new Handlebars.SafeString(JSON.stringify(obj));
    },
    eq: (a, b) => a === b, // Helper for checking if two values are equal.
    range: (start, end) => {
      // Helper to generate an array of numbers within a specified range (inclusive).
      const result = [];
      for (let i = start; i <= end; i++) result.push(i);
      return result;
    },
    add: (a, b) => a + b, // Helper for adding two numbers.
    subtract: (a, b) => a - b // Helper for subtracting two numbers.
  },
  partialsDir: ['views/partials/'] // Specify the directory where Handlebars partials (reusable template snippets) are located.
});
// Tell Express to use the 'public' directory for serving static assets, accessible under the '/public' route prefix.
app.use('/public', staticDir);
// Enable Express to parse incoming JSON request bodies.
app.use(express.json());
// Enable Express to parse incoming URL-encoded request bodies (from form submissions). 
// 'extended: true' allows for parsing of rich objects and arrays in the URL-encoded format.
app.use(express.urlencoded({ extended: true }));
// Set up Handlebars as the view engine for Express.
// Register the Handlebars engine with the '.handlebars' file extension.
app.engine('handlebars', handlebarsInstance.engine);
// Set 'handlebars' as the default view engine to be used by Express.
app.set('view engine', 'handlebars');
// Call the 'configRoutes' function, passing the Express 'app' instance. 
// This function is responsible for setting up all the application's routes and middleware.
configRoutes(app);
// Start the Express server and listen for incoming requests on port 3000.
app.listen(3000, () => {
  // Once the server starts successfully, log a message to the console indicating the server's address.
  console.log("Health Hive server running on http://localhost:3000");
});