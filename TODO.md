# TODO List for Zawadi Intel App Fixes

## 1. Hide login button after login
- [x] Verify `app.js` logic for hiding `modal-triggers` on login and showing on logout (already implemented, test functionality).

## 2. Fix home button overlay
- [x] Edit `style.css` to adjust `.top-nav` position to `fixed` and increase `z-index` to prevent overlap.

## 3. Persistent user profile on left corner
- [x] Add `<div class="user-profile">` to `index.html` and add script to check login and display profile.
- [x] Add `<div class="user-profile">` to `app.html` and add script to check login and display profile.
- [x] Add `<div class="user-profile">` to `biography.html` and add script to check login and display profile.
- [x] Add `<div class="user-profile">` to `books.html` and add script to check login and display profile.
- [x] Add `<div class="user-profile">` to `legacy.html` and add script to check login and display profile.
- [x] Add `<div class="user-profile">` to `media.html` and add script to check login and display profile.
- [x] Merged viewer.html into legacy.html, removed viewer.html references.
- [x] Add `<div class="user-profile">` to `offline.html` and add script to check login and display profile.

## 4. Home button with vertical sidebar
- [x] Modify `index.html` to include a `<div class="sidebar">` listing all HTML pages vertically (visible to all visitors).

## Followup steps
- [ ] Test login/logout to ensure buttons hide/show correctly.
- [ ] Verify profile appears on left corner across pages when logged in.
- [ ] Check sidebar on home page lists pages vertically and is visible to all.
- [ ] Ensure home button doesn't overlay other buttons.
