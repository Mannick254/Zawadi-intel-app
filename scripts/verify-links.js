const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// Recursively collect all files
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

function checkHtmlFile(filePath) {
  const htmlContent = fs.readFileSync(filePath, 'utf8');
  const linkPatterns = [/href="(.*?)"/g, /src="(.*?)"/g];
  let brokenLinks = [];

  const checkLink = (link) => {
    if (
      link &&
      !link.startsWith('http') &&
      !link.startsWith('#') &&
      !link.startsWith('mailto:')
    ) {
      let absolutePath;
      if (link.startsWith('/')) {
        absolutePath = path.join(publicDir, link);
      } else {
        absolutePath = path.resolve(path.dirname(filePath), link);
      }

      if (!fs.existsSync(absolutePath)) {
        const relativePath =
          '/' + path.relative(publicDir, absolutePath).replace(/\\/g, '/');
        brokenLinks.push({ link, relativePath });
      }
    }
  };

  linkPatterns.forEach((regex) => {
    let match;
    while ((match = regex.exec(htmlContent)) !== null) {
      checkLink(match[1]);
    }
  });

  if (brokenLinks.length > 0) {
    console.log(`Broken links in ${path.relative(publicDir, filePath)}:`);
    brokenLinks.forEach((item) =>
      console.log(`  - ${item.link} → expected at ${item.relativePath}`)
    );
  }
}

const htmlFiles = getAllFiles(publicDir).filter((file) =>
  file.endsWith('.html')
);

htmlFiles.forEach(checkHtmlFile);

console.log('Link verification complete.');
