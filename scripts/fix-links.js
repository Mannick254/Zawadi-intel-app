const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// Function to recursively get all files in a directory
const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(file => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
};

const fixHtmlFile = (filePath) => {
  let htmlContent = fs.readFileSync(filePath, 'utf8');

  // Fix relative links
  htmlContent = htmlContent.replace(/href="([^"\/\.#:]+\.html)"/g, 'href="/../articles/$1"');

  fs.writeFileSync(filePath, htmlContent, 'utf8');
};

const htmlFiles = getAllFiles(publicDir).filter(file => file.endsWith('.html'));

htmlFiles.forEach(fixHtmlFile);

console.log('Link fixing complete.');
