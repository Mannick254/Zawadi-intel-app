const fs = require('fs');
const path = require('path');

function deleteFolderRecursive(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach(file => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
  }
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const dist = 'dist';

// Clean dist
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

// Copy contents of public to dist (⚠️ don’t delete public on Vercel)
if (fs.existsSync('public')) {
  copyDirSync('public', dist);
}

console.log('Build successful!');
