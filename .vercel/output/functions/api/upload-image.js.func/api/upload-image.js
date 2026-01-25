const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { verifyToken } = require('../utils/auth-utils'); // Import the verifier

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Multer Configuration ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- Main Handler for /api/upload-image ---
const handler = async (req, res) => {
  // --- AUTHENTICATION CHECK ---
  // We check for authentication here, after multer has processed the request
  // so that we have access to the headers.
  const session = verifyToken(req);
  if (!session) {
    return res.status(401).json({ ok: false, message: "Unauthorized. Please log in to upload images." });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No image file provided.' });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'my-app-images' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ ok: false, message: 'Image upload failed.' });
        }
        return res.status(200).json({ ok: true, url: result.secure_url });
      }
    );

    stream.end(req.file.buffer);

  } catch (error) {
    console.error('Server error during upload:', error);
    res.status(500).json({ ok: false, message: 'An unexpected server error occurred.' });
  }
};

// --- Middleware Integration ---
export const config = {
  api: {
    bodyParser: false,
  },
};

module.exports = (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    return handler(req, res);
  });
};
