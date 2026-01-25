import fetch from 'node-fetch';

const SUPABASE_URL = "https://bgbwlgzyvoxfkqkwzsnh.supabase.co";

async function checkSupabaseConnection() {
  try {
    const response = await fetch(SUPABASE_URL, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnYndsZ3p5dm94Zmtxa3d6c25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NzY4OTMsImV4cCI6MjA4NDA1Mjg5M30.FNet5nkxPWm0rv3hLosv0NjvG5SL5IsAlt5HdtnO0f8'
      }
    });
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
