const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk('.', (err, files) => {
    if (err) {
        throw err;
    }

    const htmlFiles = files.filter(file => file.endsWith('.html'));

    htmlFiles.forEach(file => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading file:", file, err);
                return;
            }

            const updatedContent = data.replace(/(&copy;|©)\s*2025/g, '$1 2026');

            if (data !== updatedContent) {
                fs.writeFile(file, updatedContent, 'utf8', (err) => {
                    if (err) {
                        console.error("Error writing file:", file, err);
                        return;
                    }
                    console.log("Updated copyright in:", file);
                });
            }
        });
    });
});