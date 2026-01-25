const { supabase } = require('../public/js/supabase-client.js');

async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('articles').select('*').limit(1);
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }
    console.log('Successfully connected to Supabase.');
    // console.log('Data:', data);
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

checkSupabaseConnection();
