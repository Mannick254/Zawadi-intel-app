const fs = require('fs');
const path = require('path');

const baseUrl = 'https://mannick254.github.io/Zawadi-intel-app';
const outputFile = 'news-sitemap.xml';
const newsDir = 'news';

// Function to generate sitemap XML for news
function generateNewsSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Read the news directory
  const files = fs.readdirSync(newsDir).filter(file => file.endsWith('.html'));

  files.forEach(file => {
    const url = `${baseUrl}/news/${file}`;
    sitemap += '  <url>\n';
    sitemap += `    <loc>${url}</loc>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += '    <priority>0.8</priority>\n';
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>\n';

  fs.writeFileSync(outputFile, sitemap);
  console.log('News sitemap generated successfully!');
}

generateNewsSitemap();
