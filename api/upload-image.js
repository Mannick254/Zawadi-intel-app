import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

// Multer setup to parse multipart/form-data
const upload = multer();

// Initialize Supabase client (server-side only)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ Never expose this key client-side
);

// Disable Next.js body parser so Multer can handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, message: `Method ${req.method} Not Allowed` });
  }

  return new Promise((resolve) => {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        res.status(400).json({ ok: false, message: 'File upload error.' });
        return resolve();
      }

      try {
        if (!req.file) {
          res.status(400).json({ ok: false, message: 'No file uploaded.' });
          return resolve();
        }

        const file = req.file;
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const fileName = `${uuidv4()}-${safeName}`;

        console.log(`Uploading file: ${fileName}`);

        // Upload to Supabase bucket
        const { data, error } = await supabase.storage
          .from('Zawadiintelnews')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        // Construct public URL
        const { data: publicData } = supabase.storage
          .from('Zawadiintelnews')
          .getPublicUrl(fileName);

        res.status(200).json({
          ok: true,
          message: 'File uploaded successfully',
          path: data.path,
          url: publicData.publicUrl,
        });
      } catch (error) {
        console.error('Upload Handler Error:', error);
        res.status(500).json({
          ok: false,
          message: error.message || 'Unexpected error during file upload.',
        });
      }
      resolve();
    });
  });
}
