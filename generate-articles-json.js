const fs = require('fs');
const path = require('path');

const articlesDir = 'public/articles';
const outputFile = 'public/articles.json';
const baseUrl = 'https://zawadiintelnews.vercel.app'; // updated domain

function stripTags(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

function generateArticlesJson() {
  const articles = [];

  try {
    const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.html'));

    files.forEach(file => {
      const filePath = path.join(articlesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      const titleMatch = content.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'No Title';

      const bodyMatch = content.match(/<body>(.*?)<\/body>/s);
      const body = bodyMatch ? stripTags(bodyMatch[1]) : '';

      const stats = fs.statSync(filePath);
      const lastmod = stats.mtime.toISOString();

      const article = {
        title,
        excerpt: body.substring(0, 250) + (body.length > 250 ? '...' : ''),
        url: `${baseUrl}/articles/${file}`,
        lastmod
      };

      articles.push(article);
    });

    fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2));
    console.log(`✅ ${outputFile} generated successfully!`);
  } catch (err) {
    console.error('❌ Error generating articles.json:', err);
  }
}

generateArticlesJson();
