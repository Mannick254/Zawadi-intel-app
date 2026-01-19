const cloudinary = require('cloudinary').v2;

// --- Cloudinary Configuration ---
// IMPORTANT: Replace with your actual Cloudinary credentials
cloudinary.config({
  cloud_name: 'dtcb3ffnv',
  api_key: '557375411691254',
  api_secret: 'urdNTh44RQY4kwG-EYQ4NV7rg30', // <-- REPLACE WITH ENV VARS IN PRODUCTION
});

// --- Image Upload Route (no Multer) ---
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    // Expect the client to send base64 image data in JSON body
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ ok: false, message: 'No image provided' });
    }

    // Upload directly to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'zawadi-intel',
    });

    res.status(200).json({ ok: true, url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ ok: false, message: 'Cloudinary upload failed' });
  }
};
