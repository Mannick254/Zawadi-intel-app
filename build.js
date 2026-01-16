
const fs = require('fs');
const path = require('path');

// Check for required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in the environment.');
  process.exit(1);
}

// Define paths
const templatePath = path.resolve(__dirname, 'public', 'js', 'supabase-client.js.template');
const outputPath = path.resolve(__dirname, 'public', 'js', 'supabase-client.js');

// Read the template file
fs.readFile(templatePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading template file: ${templatePath}`, err);
    process.exit(1);
  }

  // Replace placeholders with actual environment variables
  let result = data.replace(/process\.env\.SUPABASE_URL/g, `'${process.env.SUPABASE_URL}'`);
  result = result.replace(/process\.env\.SUPABASE_ANON_KEY/g, `'${process.env.SUPABASE_ANON_KEY}'`);

  // Write the final file
  fs.writeFile(outputPath, result, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing output file: ${outputPath}`, err);
      process.exit(1);
    }
    console.log(`Successfully created ${outputPath}`);
  });
});
