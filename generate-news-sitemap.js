const fs = require('fs');
const path = require('path');

const baseUrl = 'https://zawadiintelnews.vercel.app'; // updated domain
const outputFile = 'news-sitemap.xml';
const newsDir = 'news';

// Function to generate sitemap XML for news
function generateNewsSitemap() {
  const timestamp = new Date().toISOString();

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  try {
    const files = fs.readdirSync(newsDir).filter(file => file.endsWith('.html'));

    files.forEach(file => {
      const filePath = path.join(newsDir, file);
      const stats = fs.statSync(filePath);
      const lastmod = stats.mtime.toISOString();

      const url = `${baseUrl}/news/${file}`;
      sitemap += '  <url>\n';
      sitemap += `    <loc>${url}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>\n';

    fs.writeFileSync(outputFile, sitemap);
    console.log(`✅ News sitemap generated: ${outputFile}`);
  } catch (err) {
    console.error('❌ Error generating news sitemap:', err);
  }
}

generateNewsSitemap();
