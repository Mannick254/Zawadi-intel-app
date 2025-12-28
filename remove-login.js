const fs = require('fs');
const path = require('path');

const htmlFiles = [
  'about.html',
  'app.html',
  'biography.html',
  'books.html',
  'global.html',
  'media.html',
  'profile.html',
  'public/middle-east.html',
  'public/articles/africa.html',
  'index.html'
];

// This is a simplistic regex, it might need to be adjusted
const loginFunctionRegex = /<div id="login-function-container">[\s\S]*?<\/div>/;

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}, skipping.`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  if (loginFunctionRegex.test(content)) {
    content = content.replace(loginFunctionRegex, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Removed login function from ${file}`);
  } else {
    console.log(`Login function not found in ${file}, skipping.`);
  }
});
