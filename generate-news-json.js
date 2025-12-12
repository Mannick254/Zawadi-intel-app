const fs = require('fs');
const path = require('path');

const newsDir = 'news';
const outputFile = 'news.json';
const baseUrl = 'https://mannick254.github.io/Zawadi-intel-app';

function generateNewsJson() {
  const news = [];
  const files = fs.readdirSync(newsDir).filter(file => file.endsWith('.html'));

  files.forEach(file => {
    const filePath = path.join(newsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'No Title';
    const bodyMatch = content.match(/<body>(.*?)<\/body>/s);
    const body = bodyMatch ? bodyMatch[1] : '';

    const newsItem = {
      title: title,
      content: body,
      url: `${baseUrl}/news/${file}`
    };
    news.push(newsItem);
  });

  fs.writeFileSync(outputFile, JSON.stringify(news, null, 2));
  console.log('news.json generated successfully!');
}

generateNewsJson();
