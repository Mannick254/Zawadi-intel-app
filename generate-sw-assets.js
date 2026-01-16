const fs = require('fs');
const path = require('path');

// Directories inside dist to scan for assets
const DIRECTORIES_TO_CACHE = [
  './',
  './css',
  './js',
  './articles',
  './images',
  './news',
  './icons'
];

// Files we don’t want cached
const EXCLUDED_FILES = [
  'service-worker.js',
  'generate-sw-assets.js',
  'articles_list.txt',
  'sitemap_articles.txt',
  'image_references.txt',
  'build.js'
];

// Allow distDir to be set via env, fallback to "dist"
const distDir = process.env.DIST_DIR || 'dist';

function getFilesInDirectory(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getFilesInDirectory(fullPath));
    } else if (!EXCLUDED_FILES.includes(item.name)) {
      // Normalize path for web (forward slashes)
      files.push('/' + path.relative(distDir, fullPath).replace(/\\/g, '/'));
    }
  }
  return files;
}

// Collect all files from directories
let allFiles = [];
DIRECTORIES_TO_CACHE.forEach(dir => {
  const fullDir = path.join(distDir, dir);
  allFiles = allFiles.concat(getFilesInDirectory(fullDir));
});

// Add critical files manually
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
  '/robots.txt'
];

allFiles = [...new Set([...allFiles, ...additionalFiles])]; // Deduplicate

// Path to service worker
const serviceWorkerPath = path.join(__dirname, distDir, 'service-worker.js');
if (!fs.existsSync(serviceWorkerPath)) {
  console.error('❌ Service worker not found at:', serviceWorkerPath);
  process.exit(1);
}

let serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf8');

// Build new STATIC_ASSETS array
const assetsString = JSON.stringify(allFiles, null, 2);
const newStaticAssets = `const STATIC_ASSETS = ${assetsString};`;

// Replace old array safely
const updatedContent = serviceWorkerContent.replace(
  /const STATIC_ASSETS\s*=\s*.*?;/s,
  newStaticAssets
);

fs.writeFileSync(serviceWorkerPath, updatedContent, 'utf8');
console.log('✅ Service worker static assets updated successfully.');
