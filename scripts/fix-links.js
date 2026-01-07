const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// Recursively get all files
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const curPath = path.join(dirPath, file);
    if (fs.statSync(curPath).isDirectory()) {
      arrayOfFiles = getAllFiles(curPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(curPath);
    }
  });

  return arrayOfFiles;
}

function fixHtmlFile(filePath) {
  let htmlContent = fs.readFileSync(filePath, 'utf8');

  // Rewrite links: "href='kenya-gdp.html'" → "href='/articles/kenya-gdp'"
  htmlContent = htmlContent.replace(/href="([^"\/\.#:]+)\.html"/g, 'href="/articles/$1"');

  fs.writeFileSync(filePath, htmlContent, 'utf8');
  console.log(`Fixed links in: ${filePath}`);
}

const htmlFiles = getAllFiles(publicDir).filter(file => file.endsWith('.html'));

htmlFiles.forEach(fixHtmlFile);

console.log('Link fixing complete.');
