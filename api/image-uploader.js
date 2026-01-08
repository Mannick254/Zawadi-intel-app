// api/upload-image.js
import { put } from '@vercel/blob';
import Busboy from 'busboy';

export const config = {
  api: { bodyParser: false }, // disable default parser
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const busboy = Busboy({ headers: req.headers });
    const uploads = [];

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        const blob = await put(filename || `upload-${Date.now()}`, buffer, {
          access: 'public',
          contentType: mimeType,
        });
        uploads.push(blob.url);
      });
    });

    busboy.on('finish', () => {
      res.status(200).json({ ok: true, urls: uploads });
    });

    req.pipe(busboy);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
}
