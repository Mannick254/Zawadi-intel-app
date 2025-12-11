<<<<<<< HEAD
- [x] Restructure bishop-kiengei.html to use articles.css classes
  - [x] Wrap article in <div class="news-article">
  - [x] Add <div class="article-header"> with h1 and article-meta
  - [x] Add <div class="article-body"> with img and paragraphs
- [x] Implement two-column layout in bishop-kiengei.html
  - [x] Add <div class="article-container"> with <div class="main-article"> and <div class="sidebar">
  - [x] Populate sidebar with related articles, key takeaways, and trending news
- [x] Adjust layout: main article takes remaining space after fixed sidebar
  - [x] Change main-article to flex: 1 and sidebar to flex: 0 0 300px
=======
# TODO: Fix Articles for Sitemap Compliance

## Information Gathered
- Most articles have canonical URLs pointing to https://zawadiintel.com/ instead of specific article URLs like https://mannick254.github.io/Zawadi-intel-app/articles/[filename].
- Only aids-day.html, middle-east-security.html, and global-un.html have structured data.
- Many have generic Open Graph titles like "Zawadi Intel — Breaking Stories That Shape Our World".
- Aids-day.html has canonical to world-aids-day.html, but sitemap has articles/aids-day.html.

## Plan
- Update canonical links in all articles to match sitemap.xml URLs.
- Add structured data (application/ld+json) to articles lacking it, modeled after aids-day.html.
- Make Open Graph titles specific where generic.
- Ensure titles, descriptions, and keywords are article-specific.

## Files to Edit
- [x] articles/aids-day.html: Fix canonical URL to articles/aids-day.html
- [x] articles/africa.html: Update canonical, add structured data, specific OG title
- [x] articles/amazon-ai-chip.html: Update canonical, add structured data, specific OG title
- [x] articles/article8.html: Update canonical, add structured data, specific OG title
- [x] articles/article9.html: Update canonical, add structured data, specific OG title
- [x] articles/article11.html: Update canonical, add structured data, specific OG title
- [ ] articles/article12.html: Update canonical, add structured data, specific OG title
- [ ] articles/article13.html: Update canonical, add structured data, specific OG title
- [ ] articles/article15.html: Update canonical, add structured data, specific OG title
- [ ] articles/article17.html: Update canonical, add structured data, specific OG title
- [ ] articles/article19.html: Update canonical, add structured data, specific OG title
- [ ] articles/asia-floods.html: Update canonical, add structured data, specific OG title
- [ ] articles/bahati-family.html: Update canonical, add structured data, specific OG title
- [ ] articles/bishop-kiengei.html: Update canonical, add structured data, specific OG title
- [ ] articles/breakthroughs-in-global-health.html: Update canonical, add structured data, specific OG title
- [ ] articles/cop30-outcomes.html: Update canonical, add structured data, specific OG title
- [ ] articles/cyber-utilities.html: Update canonical, add structured data, specific OG title
- [ ] articles/eac-fgm-law.html: Update canonical, add structured data, specific OG title
- [ ] articles/eastafrica-instability.html: Update canonical, add structured data, specific OG title
- [ ] articles/emerging-economies-drive-global-growth.html: Update canonical, add structured data, specific OG title
- [ ] articles/epl-chelsea.html: Update canonical, add structured data, specific OG title
- [ ] articles/epl-villa.html: Update canonical, add structured data, specific OG title
- [ ] articles/europe-defense.html: Update canonical, add structured data, specific OG title
- [ ] articles/europe-russia.html: Update canonical, add structured data, specific OG title
- [ ] articles/gaza-aid.html: Update canonical, add structured data, specific OG title
- [ ] articles/genz-politics.html: Update canonical, add structured data, specific OG title
- [ ] articles/global-debate-on-ai-regulation.html: Update canonical, add structured data, specific OG title
- [ ] articles/global-festivals-celebrate-diversity.html: Update canonical, add structured data, specific OG title
- [ ] articles/global-markets.html: Update canonical, add structured data, specific OG title
- [ ] articles/global-un.html: Already has structured data, update canonical if needed
- [ ] articles/haiti-mission.html: Update canonical, add structured data, specific OG title
- [ ] articles/kenya-gdp.html: Update canonical, add structured data, specific OG title
- [ ] articles/kenya-politics.html: Update canonical, add structured data, specific OG title
- [ ] articles/kisii-airbus.html: Update canonical, add structured data, specific OG title
- [ ] articles/lebanon-israel-talks.html: Update canonical, add structured data, specific OG title
- [ ] articles/middle-east-security.html: Already has structured data, update canonical if needed
- [ ] articles/middleeast-drones.html: Update canonical, add structured data, specific OG title
- [ ] articles/nairobi-football.html: Update canonical, add structured data, specific OG title
- [ ] articles/nairobi-gangs.html: Update canonical, add structured data, specific OG title
- [ ] articles/nairobi-matatus.html: Update canonical, add structured data, specific OG title
- [ ] articles/nakuru-industry.html: Update canonical, add structured data, specific OG title
- [ ] articles/new-era-of-space-exploration.html: Update canonical, add structured data, specific OG title
- [ ] articles/nigeria-power.html: Update canonical, add structured data, specific OG title
- [ ] articles/pdiddy-netflix.html: Update canonical, add structured data, specific OG title
- [ ] articles/raila-bodyguard.html: Update canonical, add structured data, specific OG title
- [ ] articles/ruto-wedding.html: Update canonical, add structured data, specific OG title
- [ ] articles/siaya-doctors.html: Update canonical, add structured data, specific OG title
- [ ] articles/uda-odm.html: Update canonical, add structured data, specific OG title
- [ ] articles/ukraine-energy.html: Update canonical, add structured data, specific OG title
- [ ] articles/westafrica-drugs.html: Update canonical, add structured data, specific OG title
- [ ] articles/wmo-warning.html: Update canonical, add structured data, specific OG title
- [ ] articles/world-leaders-gather-for-climate-summit.html: Update canonical, add structured data, specific OG title
- [ ] articles/zoho-eastafrica.html: Update canonical, add structured data, specific OG title

## Followup Steps
- Verify all canonical URLs match sitemap.xml.
- Check that structured data is added correctly.
- Test a few articles for proper rendering.
>>>>>>> ecca6d92d0de59a69b15d1aba40c775f6214643c
