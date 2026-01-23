require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('POSTGRES_URL:', process.env.POSTGRES_URL);