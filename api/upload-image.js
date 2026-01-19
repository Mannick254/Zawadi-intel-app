
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// --- Cloudinary Configuration ---
// IMPORTANT: Replace with your actual Cloudinary credentials
cloudinary.config({
  cloud_name: 'dtcb3ffnv',
  api_key: '557375411691254',
  api_secret: 'urdNTh44RQY4kwG-EYQ4NV7rg30', // <-- IMPORTANT: REPLACE THIS WITH YOUR SECRET
});

// --- Multer setup for memory storage ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Image Upload Route ---
module.exports = (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ ok: false, message: 'Image processing failed' });
    }

    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No image uploaded' });
    }

    const stream = new Readable();
    stream.push(req.file.buffer);
    stream.push(null);

    const cloudinaryStream = cloudinary.uploader.upload_stream(
      { folder: 'zawadi-intel' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ ok: false, message: 'Cloudinary upload failed' });
        }
        res.json({ ok: true, url: result.secure_url });
      }
    );

    stream.pipe(cloudinaryStream);
  });
};
