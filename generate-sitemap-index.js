const fs = require('fs');

const baseUrl = 'https://mannick254.github.io/Zawadi-intel-app';
const outputFile = 'sitemap-index.xml';

// Function to generate sitemap index XML
function generateSitemapIndex() {
  let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapIndex += '<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n';
  sitemapIndex += '<sitemapindex xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add main sitemap
  sitemapIndex += '  <sitemap>\n';
  sitemapIndex += `    <loc>${baseUrl}/sitemap.xml</loc>\n`;
  sitemapIndex += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
  sitemapIndex += '  </sitemap>\n';

  // Add articles sitemap
  sitemapIndex += '  <sitemap>\n';
  sitemapIndex += `    <loc>${baseUrl}/articles-sitemap.xml</loc>\n`;
  sitemapIndex += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
  sitemapIndex += '  </sitemap>\n';

  sitemapIndex += '</sitemapindex>\n';

  fs.writeFileSync(outputFile, sitemapIndex);
  console.log('Sitemap index generated successfully!');
}

generateSitemapIndex();
