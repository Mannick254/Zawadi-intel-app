const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '../public/articles');
const globalJsonPath = path.join(__dirname, '../public/data/global.json');

// Function to extract article details from HTML content
const extractArticleDetails = (htmlContent) => {
  const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
  const summaryMatch = htmlContent.match(/<meta name="description" content="(.*?)"\/>/);
  const imageMatch = htmlContent.match(/<meta property="og:image" content="(.*?)"\/>/);
  const dateMatch = htmlContent.match(/<meta property="article:published_time" content="(.*?)"\/>/);
  const categoryMatch = htmlContent.match(/<meta property="article:section" content="(.*?)"\/>/);

  return {
    title: titleMatch ? titleMatch[1] : '',
    summary: summaryMatch ? summaryMatch[1] : '',
    image: imageMatch ? imageMatch[1].replace('https://zawadiintelnews.vercel.app/', '') : '',
    date: dateMatch ? dateMatch[1] : '',
    category: categoryMatch ? categoryMatch[1] : '',
  };
};

// Read all HTML files in the articles directory
fs.readdir(articlesDir, (err, files) => {
  if (err) {
    console.error('Error reading articles directory:', err);
    return;
  }

  const globalArticles = [];
  files.forEach(file => {
    if (file.endsWith('.html')) {
      const filePath = path.join(articlesDir, file);
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      const details = extractArticleDetails(htmlContent);

      if (details.category === 'Global') {
        globalArticles.push({
          title: details.title,
          url: `articles/${file}`,
          image: details.image,
          altText: details.title,
          summary: details.summary,
          date: details.date,
          highlight: '', // You may want to generate this dynamically
          quote: '', // You may want to generate this dynamically
          category: 'Global',
        });
      }
    }
  });

  // Write the updated array to global.json
  fs.writeFile(globalJsonPath, JSON.stringify(globalArticles, null, 2), (err) => {
    if (err) {
      console.error('Error writing to global.json:', err);
      return;
    }
    console.log('public/data/global.json has been updated successfully.');
  });
});
