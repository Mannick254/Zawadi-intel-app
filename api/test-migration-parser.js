const fs = require('fs').promises;
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'public', 'articles');
const TEST_FILE = 'zoho-eastafrica.html';

async function testParser() {
  console.log('--- Running Migration Parser Test ---');
  try {
    const filePath = path.join(ARTICLES_DIR, TEST_FILE);
    const htmlContent = await fs.readFile(filePath, 'utf8');
    console.log('✅ File read successfully.');

    let title = null, imageUrl = null, content = null;

    // Title extraction
    const h1Match = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (h1Match) title = h1Match[1].trim();
    if (!title) {
      const titleTagMatch = htmlContent.match(/<title>([\s\S]*?)<\/title>/);
      if (titleTagMatch) {
        title = titleTagMatch[1].replace(/Zawadi Intel\s*—\s*/, '').replace(/\|\s*Zawadi Intel/, '').trim();
      }
    }
    if (!title) {
      const jsonLdMatch = htmlContent.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          if (jsonLd.headline) title = jsonLd.headline.trim();
        } catch {}
      }
    }

    // Image extraction
    const imageMatch = htmlContent.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/);
    if (imageMatch) imageUrl = imageMatch[1].trim();

    // Body extraction
    const bodyMatch = htmlContent.match(/<div class="article-body"[^>]*>([\s\S]*?)<\/div>/)
                  || htmlContent.match(/<article[^>]*>([\s\S]*?)<\/article>/);
    if (bodyMatch) {
      content = bodyMatch[1]
        .replace(/<p><a href="[^>]*">.+?Back to Homepage.*?<\/a><\/p>\s*$/, '')
        .replace(/<[^>]+>/g, '') // strip HTML tags
        .trim();
    }

    console.log('\n--- PARSED DATA ---');
    console.log('Title:', title || 'Not Found');
    console.log('Image URL:', imageUrl || 'Not Found');
    console.log('Content Found:', !!content);
    console.log('Content Length:', content ? content.length : 0);
    console.log('-------------------\n');

    if (!title || !content) {
      console.warn('⚠️ Could not parse all required data.');
    } else {
      console.log('✅ Successfully parsed all required data.');
    }

    return { title, imageUrl, content };

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testParser();
