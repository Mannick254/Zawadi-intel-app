import fetch from 'node-fetch';

const SUPABASE_URL = "https://bgbwlgzyvoxfkqkwzsnh.supabase.co";

async function checkSupabaseConnection() {
  try {
    const response = await fetch(SUPABASE_URL);
    if (response.ok) {
      console.log('Successfully connected to Supabase.');
    } else {
      console.error('Error connecting to Supabase:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

checkSupabaseConnection();
