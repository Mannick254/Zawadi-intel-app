// index.js
import './config.js';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// --- Import route handlers ---
import authHandler from './auth.js';
import verifyHandler from './verify.js';
import articlesHandler from './articles.js';
import uploadImageHandler from './upload-image.js';
import healthHandler from './health.js';

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- Rate limiting ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// --- API Routes ---
app.post('/api/auth', authHandler);
app.post('/api/verify', verifyHandler);
app.all('/api/articles', articlesHandler);
app.all('/api/articles/:id', articlesHandler);
app.post('/api/upload-image', uploadImageHandler);

// Health check route
app.get('/api/health', healthHandler);

// --- Static File Serving ---
app.use(express.static('dist'));

// --- Catch-all for client-side routing ---
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile('index.html', { root: 'dist' });
  } else {
    res.status(404).json({ message: 'API endpoint not found' });
  }
});

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export default app;
