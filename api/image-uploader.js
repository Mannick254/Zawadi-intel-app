// api/upload-image.js
import { put } from '@vercel/blob';
import Busboy from 'busboy';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const busboy = Busboy({ headers: req.headers });
    const uploadPromises = [];

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        // push promise instead of awaiting here
        uploadPromises.push(
          put(filename || `upload-${Date.now()}`, buffer, {
            access: 'public',
            contentType: mimeType,
          }).then(blob => blob.url)
        );
      });
    });

    busboy.on('finish', async () => {
      try {
        const urls = await Promise.all(uploadPromises);
        res.status(200).json({ ok: true, urls });
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
