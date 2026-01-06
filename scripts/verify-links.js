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

const checkHtmlFile = (filePath) => {
  const htmlContent = fs.readFileSync(filePath, 'utf8');
  const hrefRegex = /href="(.*?)"/g;
  const srcRegex = /src="(.*?)"/g;
  let match;
  let brokenLinks = [];

  const checkLink = (link) => {
    if (link && !link.startsWith('http') && !link.startsWith('#') && !link.startsWith('mailto:')) {
      let absolutePath;
      if (link.startsWith('/')) {
        absolutePath = path.join(publicDir, link);
      } else {
        absolutePath = path.resolve(path.dirname(filePath), link);
      }
      
      if (!fs.existsSync(absolutePath)) {
          const relativePath = '/' + path.relative(publicDir, absolutePath).replace(/\\/g, '/');
          brokenLinks.push({link, absolutePath, relativePath});
      }
    }
  };

  while ((match = hrefRegex.exec(htmlContent)) !== null) {
    checkLink(match[1]);
  }

  while ((match = srcRegex.exec(htmlContent)) !== null) {
    checkLink(match[1]);
  }

  if (brokenLinks.length > 0) {
    console.log(`Broken links in ${path.relative(publicDir, filePath)}:`);
    brokenLinks.forEach(item => console.log(`  - ${item.link}`))
  }
};

const htmlFiles = getAllFiles(publicDir).filter(file => file.endsWith('.html'));

htmlFiles.forEach(checkHtmlFile);

console.log('Link verification complete.');
