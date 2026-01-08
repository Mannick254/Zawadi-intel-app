// api/upload-image.js
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // disable default body parser for raw file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    // Collect raw request data into a buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Give the file a name (timestamp or original filename)
    const fileName = `upload-${Date.now()}.jpg`;

    // Upload to Vercel Blob
    const blob = await put(fileName, buffer, {
      access: 'public',
    });

    res.status(200).json({ ok: true, url: blob.url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
}
