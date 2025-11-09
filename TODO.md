# TODO: Fix Zawadi Intel Project Issues

- [ ] Resolve merge conflicts in CSS files (style.css, layout.css, theme.css) - remove HEAD sections, keep polished code
  - [ ] Edit css/style.css: Remove conflict markers, consolidate polished styles (e.g., story-card, install-banner), eliminate redundant headers
  - [ ] Edit css/layout.css: Resolve conflicts, retain refined styles (e.g., responsive queries), merge top-nav/hero-banner/grid with consistent properties
  - [ ] Edit css/theme.css: Clean up markers, merge typography/colors/layouts, retain East African Editorial Tone elements
  - [ ] Validate CSS files for syntax errors
  - [ ] Test website (load index.html) to ensure styles render correctly
  - [ ] Check for remaining merge markers or broken references in other files
- [ ] Update missing image references in index.html to existing images (rail.jpg -> raila-cover.png, etc.)
- [ ] Remove screenshot references from manifest.json and src/manifest.json
- [ ] Remove duplicate "Blessed Hots TV" install banner from index.html
- [ ] Fix broken link in africa.html (biographies.html -> biography.html)
- [ ] Remove non-existent page references from main.js cache array (news.html, offline.html, sport.html)
- [ ] Fix service worker cache paths (/style.css -> css/style.css, /js/main.js -> main.js)
- [ ] Clean up placeholder citations in index.html (remove UUID placeholders)
- [ ] Fix malformed HTML structure in index.html (NaN text, missing tags)
