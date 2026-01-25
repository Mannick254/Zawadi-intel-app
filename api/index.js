
import './config.js';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Import route handlers
import registerHandler from './register.js';
import loginHandler from './login.js';
import logoutHandler from './logout.js';
import verifyHandler from './verify.js';
import articlesHandler from './articles.js';
import uploadImageHandler from './upload-image.js';

const app = express();
const port = process.env.PORT || 3001;

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
app.post('/api/register', registerHandler);
app.post('/api/login', loginHandler);
app.post('/api/logout', logoutHandler);
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
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
