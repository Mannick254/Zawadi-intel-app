
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
// Make sure you have the GOOGLE_APPLICATION_CREDENTIALS environment variable set
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: '<YOUR_DATABASE_URL>'
});

const db = admin.database();
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));

db.ref().set(data)
  .then(() => {
    console.log('Data migrated to Firebase successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error migrating data to Firebase:', error);
    process.exit(1);
  });
