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

            if (data.includes('clock-calendar.js')) {
                console.log("Skipping file, widget already exists:", file);
                return;
            }

            let updatedContent = data.replace(/<aside class="sidebar">/, '<aside class="sidebar">\n      <div class="sidebar-widget">\n        <div id="clock"></div>\n        <div id="calendar-widget"></div>\n      </div>');

            const depth = file.split(path.sep).length - 1;
            const scriptPath = Array(depth).fill('..').join('/') + '/public/js/clock-calendar.js';

            updatedContent = updatedContent.replace(/<\/body>/, `  <script src="${scriptPath}" defer></script>\n</body>`);

            if (data !== updatedContent) {
                fs.writeFile(file, updatedContent, 'utf8', (err) => {
                    if (err) {
                        console.error("Error writing file:", file, err);
                        return;
                    }
                    console.log("Added clock widget to:", file);
                });
            }
        });
    });
});