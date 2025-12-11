const fs = require('fs');
const path = require('path');

const baseUrl = 'https://mannick254.github.io/Zawadi-intel-app';
const outputFile = 'sitemap.xml';

// List of HTML files to include in the sitemap
const htmlFiles = [
  'index.html',
  'biography.html',
  'books.html',
  'africa.html',
  'global.html',
  'media.html',
  'middle-east.html',
  'profile.html',
  'admin.html',
  'app.html'
];

// Function to generate sitemap XML
function generateSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n';
<<<<<<< HEAD
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
=======
  sitemap += '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n';
>>>>>>> ecca6d92d0de59a69b15d1aba40c775f6214643c

  htmlFiles.forEach(file => {
    const url = file === 'index.html' ? `${baseUrl}/` : `${baseUrl}/${file}`;
    const priority = file === 'index.html' ? '1.0' : '0.8';
    sitemap += '  <url>\n';
    sitemap += `    <loc>${url}</loc>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += `    <priority>${priority}</priority>\n`;
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>\n';

  fs.writeFileSync(outputFile, sitemap);
  console.log('Sitemap generated successfully!');
}

generateSitemap();
