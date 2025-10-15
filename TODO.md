# TODO: Add Desktop Features - Photo Upload with Transitions

## Steps to Complete

1. **Edit app.html**
   - Add file input for photo upload in the main profile form (id="profileForm").
   - Add file input for photo upload in the profile modal form (id="profileFormModal").
   - Make the avatar div (class="avatar") clickable to toggle visibility of the upload input with smooth transitions.
   - Ensure upload area hides automatically after upload (Chrome-style behavior).

2. **Edit app.js**
   - Add event listener for avatar click to toggle upload input visibility.
   - Add file input change handler to read selected file, convert to base64, and store in profile data.
   - Update loadProfile and loadProfileModal functions to display uploaded photo in avatar (fallback to emoji).
   - Update profile save logic to include photo data.

3. **Edit style.css**
   - Add CSS transitions (fade-in/fade-out) for the upload area visibility toggle.
   - Style the file input and upload area for desktop usability.

4. **Test Implementation**
   - Test photo upload functionality.
   - Verify smooth transitions on avatar click and after upload.
   - Check profile display with uploaded photo.
   - Ensure desktop compatibility (file picker, etc.).
