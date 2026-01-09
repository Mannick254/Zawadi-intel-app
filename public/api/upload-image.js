// api/image-uploader.js
import { put } from '@vercel/blob';
import Busboy from 'busboy';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const busboy = Busboy({ headers: req.headers, limits: { files: 1 } });
    let uploadPromise;

    busboy.on('file', (fieldname, file, info) => {
      // The frontend sends the file with the name 'image'
      if (fieldname !== 'image') {
        file.resume(); // Ignore other files
        return;
      }

      const { filename, mimeType } = info;
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        uploadPromise = put(filename || `upload-${Date.now()}`, buffer, {
          access: 'public',
          contentType: mimeType,
        });
      });
    });

    busboy.on('finish', async () => {
      if (!uploadPromise) {
          return res.status(400).json({ ok: false, message: 'No file with fieldname "image" found.' });
      }
      try {
        const blob = await uploadPromise;
        res.status(200).json({ ok: true, url: blob.url });
      } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ ok: false, message: err.message });
      }
    });

    req.pipe(busboy);
  } catch (err) {
    console.error('Busboy error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
}
