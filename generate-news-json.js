const fs = require('fs');
const path = require('path');

const newsDir = 'news';
const outputFile = 'news.json';
const baseUrl = 'https://zawadiintelnews.vercel.app'; // updated domain

function stripTags(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

function generateNewsJson() {
  const news = [];

  try {
    const files = fs.readdirSync(newsDir).filter(file => file.endsWith('.html'));

    files.forEach(file => {
      const filePath = path.join(newsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      const titleMatch = content.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'No Title';

      const bodyMatch = content.match(/<body>(.*?)<\/body>/s);
      const body = bodyMatch ? stripTags(bodyMatch[1]) : '';

      const stats = fs.statSync(filePath);
      const lastmod = stats.mtime.toISOString();

      const newsItem = {
        title,
        excerpt: body.substring(0, 200) + (body.length > 200 ? '...' : ''),
        url: `${baseUrl}/news/${file}`,
        lastmod
      };

      news.push(newsItem);
    });

    fs.writeFileSync(outputFile, JSON.stringify(news, null, 2));
    console.log(`✅ ${outputFile} generated successfully!`);
  } catch (err) {
    console.error('❌ Error generating news.json:', err);
  }
}

generateNewsJson();
