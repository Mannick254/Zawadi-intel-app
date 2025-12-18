const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_CACHE = [
  './',
  './css',
  './js',
  './articles',
  './images',
  './news',
  './icons'
];

const EXCLUDED_FILES = [
  'service-worker.js',
  'generate-sw-assets.js',
  'firebase-debug.log',
  'articles_list.txt',
  'sitemap_articles.txt',
  'image_references.txt',
  'build.js'
];

const dist = 'dist';

function getFilesInDirectory(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getFilesInDirectory(fullPath));
    } else if (!EXCLUDED_FILES.includes(item.name)) {
      files.push('/' + path.relative(dist, fullPath).replace(/\\/g, '/')); // Normalize path for web
    }
  }
  return files;
}

let allFiles = [];
DIRECTORIES_TO_CACHE.forEach(dir => {
  const fullDir = path.join(dist, dir);
  if (fs.existsSync(fullDir)) {
    allFiles = allFiles.concat(getFilesInDirectory(fullDir));
  }
});

// Add specific important files that might not be in the directories
const additionalFiles = [
  '/index.html',
  '/global.html',
  '/about.html',
  '/account.html',
  '/app.html',
  '/biography.html',
  '/books.html',
  '/media.html',
  '/offline.html',
  '/profile.html',
  '/search.html',
  '/manifest.json',
  '/robots.txt',
];

allFiles = [...new Set([...allFiles, ...additionalFiles])]; // Remove duplicates

const serviceWorkerPath = path.join(__dirname, dist, 'service-worker.js');
let serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf8');

const assetsString = JSON.stringify(allFiles, null, 2);
const newStaticAssets = `const STATIC_ASSETS = ${assetsString};`;

// Replace the old STATIC_ASSETS array with the new one
serviceWorkerContent = serviceWorkerContent.replace(/const STATIC_ASSETS = \[\s*([\s\S]*?)\s*\];/, newStaticAssets);

fs.writeFileSync(serviceWorkerPath, serviceWorkerContent, 'utf8');

console.log('Service worker static assets updated successfully.');
