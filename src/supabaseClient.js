import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bgbwlgzyvoxfkqkwzsnh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnYndsZ3p5dm94Zmtxa3d6c25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NzY4OTMsImV4cCI6MjA4NDA1Mjg5M30.FNet5nkxPWm0rv3hLosv0NjvG5SL5IsAlt5HdtnO0f8';

export const supabase = createClient(supabaseUrl, supabaseKey)
