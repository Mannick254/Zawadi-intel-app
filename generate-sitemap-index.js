const fs = require('fs');

const baseUrl = 'https://zawadiintelnews.vercel.app'; // updated domain
const outputFile = 'sitemap-index.xml';

// List of sitemap files to include
const sitemaps = [
  'sitemap.xml',
  'articles-sitemap.xml',
  'biographies-sitemap.xml',
  'media-sitemap.xml',
  'books-sitemap.xml',
  'archive-sitemap.xml'
];

function generateSitemapIndex() {
  const timestamp = new Date().toISOString();

  let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapIndex += '<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n';
  sitemapIndex += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Loop through all sitemaps
  sitemaps.forEach(file => {
    sitemapIndex += '  <sitemap>\n';
    sitemapIndex += `    <loc>${baseUrl}/${file}</loc>\n`;
    sitemapIndex += `    <lastmod>${timestamp}</lastmod>\n`;
    sitemapIndex += '  </sitemap>\n';
  });

  sitemapIndex += '</sitemapindex>\n';

  try {
    fs.writeFileSync(outputFile, sitemapIndex);
    console.log(`✅ Sitemap index generated: ${outputFile}`);
  } catch (err) {
    console.error('❌ Error writing sitemap index:', err);
  }
}

generateSitemapIndex();
