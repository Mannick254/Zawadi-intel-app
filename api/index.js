
import './config.js';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Import route handlers
import authHandler from './auth.js';
import verifyHandler from './verify.js';
import articlesHandler from './articles.js';
import uploadImageHandler from './upload-image.js';
import healthHandler from './health.js'; // Import the health handler

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cors());

// Rate limiting to prevent brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// --- API Routes ---
app.post('/api/auth', authHandler);
app.get('/api/health', healthHandler); // Add the health check route
app.post('/api/verify', verifyHandler);
app.all('/api/articles', articlesHandler);
app.all('/api/articles/:id', articlesHandler);
app.post('/api/upload-image', uploadImageHandler);

// --- Static File Serving ---
// Serve the main vite-built application
app.use(express.static('dist'));

// --- Catch-all for client-side routing ---
// This ensures that refreshing a client-side route (e.g., /about) doesn't 404
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile('index.html', { root: 'dist' });
  } else {
    res.status(404).json({ message: 'API endpoint not found' });
  }
});

// --- Server Startup ---
export default app;
