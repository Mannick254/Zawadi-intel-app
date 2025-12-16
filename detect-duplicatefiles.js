#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = new Set(['.git', 'node_modules', '.github']);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const res = path.join(dir, d.name);
    if (d.isDirectory()) {
      if (IGNORED_DIRS.has(d.name)) return [];
      return walk(res);
    }
    return res;
  });
}

const htmlFiles = walk('.').filter((f) => f.endsWith('.html'));

const titleMap = new Map();
const conflictFiles = [];

const titleRegex = /<title>([\s\S]*?)<\/title>/i;
const conflictRegex = /^(<<<<<<<|=======|>>>>>>>)/m;

htmlFiles.forEach((file) => {
  try {
    const content = fs.readFileSync(file, 'utf8');

    if (conflictRegex.test(content)) conflictFiles.push(file);

    const m = content.match(titleRegex);
    const rawTitle = m ? m[1] : null;
    // Collapse internal whitespace and trim
    const title = rawTitle ? rawTitle.replace(/\s+/g, ' ').trim() : '(no title)';

    if (!titleMap.has(title)) titleMap.set(title, []);
    titleMap.get(title).push(file);
  } catch (err) {
    console.error('Error reading', file, err.message);
  }
});

// Report duplicates
let foundDuplicates = false;
console.log('=== Duplicate title report ===\n');
for (const [title, files] of titleMap.entries()) {
  if (files.length > 1) {
    foundDuplicates = true;
    console.log(`Title: "${title}"`);
    files.forEach((f) => console.log('  -', f));
    console.log('');
  }
}
if (!foundDuplicates) console.log('No exact duplicate titles found (after trimming).');

if (conflictFiles.length) {
  console.log('\n=== Files with unresolved merge conflict markers ===');
  conflictFiles.forEach((f) => console.log(' -', f));
} else {
  console.log('\nNo unresolved merge conflict markers detected.');
}

console.log('\nScan complete.');
