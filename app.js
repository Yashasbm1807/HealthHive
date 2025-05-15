import express from 'express';
import exphbs from 'express-handlebars';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDb } from './config/mongoConnection.js';
import configRoutes from './routes/index.js';
import dotenv from 'dotenv';
import methodOverride from 'method-override';
import { initCollections } from './config/initCollections.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const db = await connectToDb();
await initCollections();

// Middleware setup
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Session setup
app.use(
  session({
    name: 'AuthCookie',
    secret: process.env.SESSION_SECRET || 'someSuperSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  })
);

// Logging middleware
app.use((req, res, next) => {
  console.log(`[APP] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Cache-control middleware
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Handlebars configuration
const hbs = exphbs.create({
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, 'views/partials'),
  layoutsDir: path.join(__dirname, 'views/layouts'),
  extname: '.handlebars',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  helpers: {
    eq: (a, b) => (a?.toString() || '') === (b?.toString() || ''),
    neq: (a, b) => (a?.toString() || '') !== (b?.toString() || ''),
    gt: (a, b) => a > b,
    gte: (a, b) => a >= b,
    lt: (a, b) => a < b,
    lte: (a, b) => a <= b,
    toString: (obj) => obj ? String(obj) : '',
    formatDate: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    isArray: (value) => Array.isArray(value),
    json: (context) => JSON.stringify(context),
    range: (from, to) => Array.from({length: (to - from + 1)}, (_, i) => from + i),
    subtract: (a, b) => a - b,
    add: (a, b) => a + b,
    truncate: (str, len) => (str.length > len ? str.substring(0, len) + '...' : str),
    // Added helper for checking if user owns the place
    isOwner: (placeUserId, sessionUserId) => placeUserId?.toString() === sessionUserId?.toString()
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Ensure views directory exists
import fs from 'fs';
const viewsDir = path.join(__dirname, 'views');
if (!fs.existsSync(viewsDir)) {
  fs.mkdirSync(viewsDir, { recursive: true });
}

// Create manage-places view if it doesn't exist
const managePlacesViewPath = path.join(viewsDir, 'manage-places.handlebars');
if (!fs.existsSync(managePlacesViewPath)) {
  const defaultTemplate = `
  <div class="container mt-4">
    <h1>{{title}}</h1>
    
    {{#if success}}
      <div class="alert alert-success">{{success}}</div>
    {{/if}}
    
    {{#if error}}
      <div class="alert alert-danger">{{error}}</div>
    {{/if}}

    {{#if places.length}}
      <div class="row">
        {{#each places}}
          <div class="col-md-4 mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">{{name}}</h5>
                <h6 class="card-subtitle mb-2 text-muted">{{type}}</h6>
                <p class="card-text">{{description}}</p>
                <p class="card-text"><small class="text-muted">{{address}}, {{city}}</small></p>
                <div class="d-flex justify-content-between">
                  <a href="/manage-places/{{_id}}" class="btn btn-sm btn-primary">View</a>
                  <a href="/manage-places/{{_id}}/edit" class="btn btn-sm btn-secondary">Edit</a>
                  <form action="/manage-places/{{_id}}?_method=DELETE" method="POST">
                    <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        {{/each}}
      </div>
    {{else}}
      <div class="alert alert-info">
        You haven't added any places yet.
        <a href="/manage-places/add" class="alert-link">Add your first place</a>
      </div>
    {{/if}}
  </div>`;
  
  fs.writeFileSync(managePlacesViewPath, defaultTemplate);
}

// Routes
configRoutes(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Not Found',
    error: 'The requested page could not be found'
  });
});

// Server startup
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});