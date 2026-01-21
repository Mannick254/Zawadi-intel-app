// This is a diagnostic script to test reading and parsing a single article file.
// It does NOT connect to the database.
// To run it, use: node api/test-migration-parser.js

const fs = require('fs').promises;
const path = require('path');

// --- Configuration ---
// Use __dirname to create a robust path to the articles directory
const ARTICLES_DIR = path.join(__dirname, '..', 'public', 'articles');
const TEST_FILE = 'zoho-eastafrica.html'; // A file we know exists

async function testParser() {
  console.log('--- Running Migration Parser Test ---');
  try {
    const filePath = path.join(ARTICLES_DIR, TEST_FILE);
    console.log(`Attempting to read file: ${filePath}`);

    const htmlContent = await fs.readFile(filePath, 'utf8');
    console.log('✅ File read successfully.');

    let title = null;
    let imageUrl = null;
    let content = null;

    // --- Robust Title Extraction ---
    const h1Match = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (h1Match && h1Match[1]) {
      title = h1Match[1].trim();
    }
    if (!title) {
      const titleTagMatch = htmlContent.match(/<title>([\s\S]*?)<\/title>/);
      if (titleTagMatch && titleTagMatch[1]) {
        title = titleTagMatch[1].replace(/Zawadi Intel\s*—\s*/, '').replace(/\|\s*Zawadi Intel/, '').trim();
      }
    }
    if (!title) {
      const jsonLdMatch = htmlContent.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      if (jsonLdMatch && jsonLdMatch[1]) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          if (jsonLd.headline) title = jsonLd.headline.trim();
        } catch (e) { /* Ignore JSON parsing errors */ }
      }
    }

    // --- Image and Body Extraction ---
    const imageMatch = htmlContent.match(/<meta\s+property="og:image"\s+content="([^"].+?)"/);
    imageUrl = imageMatch ? imageMatch[1].trim() : null;

    const bodyMatch = htmlContent.match(/<div class="article-body"[^>]*>([\s\S]*?)<\/div>/);
    if (bodyMatch && bodyMatch[1]) {
      content = bodyMatch[1].replace(/<p><a href="[^>]*">.+?Back to Homepage.*?<\/a><\/p>\s*$/, '').trim();
    }

    console.log('\n--- PARSED DATA ---');
    console.log('Title:', title ? `"${title}"` : 'Not Found');
    console.log('Image URL:', imageUrl ? `"${imageUrl}"` : 'Not Found');
    console.log('Content Found:', content ? 'Yes' : 'No');
    console.log('Content Length:', content ? content.length : 0);
    console.log('-------------------\n');

    if (!title || !content) {
        console.warn('⚠️  Could not parse all required data from the file.');
    } else {
        console.log('✅  Successfully parsed all required data.');
    }

  } catch (error) {
    console.error('❌ An error occurred during the test:', error);
  }
}

testParser();
