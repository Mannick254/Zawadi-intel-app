const fs = require('fs');
const path = require('path');

const baseUrl = 'https://mannick254.github.io/Zawadi-intel-app';
const outputFile = 'articles-sitemap.xml';
const articlesDir = 'articles';

// Function to generate sitemap XML for articles
function generateArticlesSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n';
  sitemap += '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Read the articles directory
  const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.html'));

  files.forEach(file => {
    const url = `${baseUrl}/articles/${file}`;
    sitemap += '  <url>\n';
    sitemap += `    <loc>${url}</loc>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += '    <priority>0.8</priority>\n';
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>\n';

  fs.writeFileSync(outputFile, sitemap);
  console.log('Articles sitemap generated successfully!');
}

generateArticlesSitemap();
