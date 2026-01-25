
import './config.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method, query, body } = req;

  switch (method) {
    case 'GET':
      if (query.id) {
        // Fetch a single article by ID
        try {
          const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', query.id)
            .single();

          if (error) throw error;
          if (!data) return res.status(404).json({ message: 'Article not found' });

          return res.status(200).json(data);
        } catch (error) {
          return res.status(500).json({ message: error.message });
        }
      } else {
        // Fetch all articles
        try {
          const { data, error } = await supabase
            .from('articles')
            .select('*');

          if (error) throw error;

          return res.status(200).json(data);
        } catch (error) {
          return res.status(500).json({ message: error.message });
        }
      }

    case 'POST':
      // Create a new article
      try {
        const { data, error } = await supabase
          .from('articles')
          .insert([body])
          .single();

        if (error) throw error;

        return res.status(201).json(data);
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }

    case 'PUT':
      // Update an article by ID
      try {
        const { data, error } = await supabase
          .from('articles')
          .update(body)
          .eq('id', query.id)
          .single();

        if (error) throw error;

        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }

    case 'DELETE':
      // Delete an article by ID
      try {
        const { data, error } = await supabase
          .from('articles')
          .delete()
          .eq('id', query.id)
          .single();

        if (error) throw error;

        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
