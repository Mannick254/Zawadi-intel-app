import './config.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method, query } = req;
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  try {
    switch (method) {
      case 'GET': {
        if (query.id) {
          // Fetch a single article by ID
          const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', query.id)
            .single();

          if (error) return res.status(500).json({ ok: false, message: error.message });
          if (!data) return res.status(404).json({ ok: false, message: 'Article not found' });

          return res.status(200).json({ ok: true, data });
        } else {
          // Fetch all or only published articles depending on query
          let q = supabase.from('articles').select('*').order('created_at', { ascending: false });

          if (query.published === 'true') {
            q = q.eq('published', true);
          }

          const { data, error } = await q;
          if (error) return res.status(500).json({ ok: false, message: error.message });

          return res.status(200).json({ ok: true, data });
        }
      }

      case 'POST': {
        if (!body?.title) {
          return res.status(400).json({ ok: false, message: 'Title is required' });
        }

        const { data: inserted, error: insertError } = await supabase
          .from('articles')
          .insert([{ 
            title: body.title, 
            content: body.content, 
            published: body.published ?? true // default to published
          }])
          .select();

        if (insertError) return res.status(500).json({ ok: false, message: insertError.message });

        return res.status(201).json({ ok: true, data: inserted[0] });
      }

      case 'PUT': {
        if (!query.id) {
          return res.status(400).json({ ok: false, message: 'Article ID is required for update' });
        }

        const { data: updated, error: updateError } = await supabase
          .from('articles')
          .update(body)
          .eq('id', query.id)
          .select()
          .single();

        if (updateError) return res.status(500).json({ ok: false, message: updateError.message });

        return res.status(200).json({ ok: true, data: updated });
      }

      case 'DELETE': {
        if (!query.id) {
          return res.status(400).json({ ok: false, message: 'Article ID is required for delete' });
        }

        const { error: deleteError } = await supabase
          .from('articles')
          .delete()
          .eq('id', query.id);

        if (deleteError) return res.status(500).json({ ok: false, message: deleteError.message });

        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ ok: false, message: `Method ${method} Not Allowed` });
    }
  } catch (err) {
    console.error('Articles API Error:', err);
    return res.status(500).json({ ok: false, message: 'Unexpected server error' });
  }
}
