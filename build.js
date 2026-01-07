const fs = require('fs');
const path = require('path');

const deleteFolderRecursive = function(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file, index) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
  }
};


function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ? copyDirSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
  }
}

const dist = 'dist';

// Create dist directory
deleteFolderRecursive(dist);
fs.mkdirSync(dist, { recursive: true });

// Files to copy from root
const rootFiles = [
  'index.html', 'global.html', 'about.html', 'account.html', 'app.html',
  'biography.html', 'books.html', 'media.html', 'offline.html', 'profile.html',
  'search.html', 'manifest.json', 'robots.txt', 'service-worker.js'
];

rootFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(dist, file));
  }
});

// Directories to copy from root
const rootDirs = ['css', 'js', 'icons'];

rootDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    copyDirSync(dir, path.join(dist, dir));
  }
});

// Copy contents of public to dist
if (fs.existsSync('public')) {
  copyDirSync('public', dist);
  deleteFolderRecursive('public');
}

console.log('Build successful!');
