Zawadi minimal server

This small server provides two endpoints used by the site for tracking login counts:

- POST /api/login  -- body: { username, ts }
- GET  /api/stats  -- returns total and recent logins

How to run:

1. Open a terminal in this folder and run:

   npm install
   npm start

2. The server will listen on port 3001 by default. To change the port, set PORT environment variable.

<<<<<<< HEAD
If you run the server from the project root, it will also serve the static site so you can visit http://localhost:3001/admin.html
=======
If you run the server from the project root, it will also serve the static site so you can visit https://localhost:3001/admin.html
>>>>>>> ecca6d92d0de59a69b15d1aba40c775f6214643c
