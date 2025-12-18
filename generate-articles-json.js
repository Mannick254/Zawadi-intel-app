const fs = require('fs');
const path = require('path');

const articlesDir = 'public/articles';
const outputFile = 'public/articles.json';
const baseUrl = 'https://mannick254.github.io/Zawadi-intel-app';

function generateArticlesJson() {
  const articles = [];
  const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.html'));

  files.forEach(file => {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'No Title';
    const bodyMatch = content.match(/<body>(.*?)<\/body>/s);
    const body = bodyMatch ? bodyMatch[1] : '';

    const article = {
      title: title,
      content: body,
      url: `${baseUrl}/articles/${file}`
    };
    articles.push(article);
  });

  fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2));
  console.log('articles.json generated successfully!');
}

generateArticlesJson();
