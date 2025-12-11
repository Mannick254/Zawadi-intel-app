
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const admin = require('firebase-admin');
const webpush = require('web-push');
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = process.env.PORT || 3000;

// Firebase Admin SDK
// Note: The service-account.json file is not in the repository for security reasons.
// You will need to create your own service account file and place it in the server directory.
try {
  const serviceAccount = require('./service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://zawadi-intel.firebaseio.com'
  });
} catch (error) {
  console.warn('Firebase Admin SDK could not be initialized. Some features will be disabled.');
}
const db = admin.firestore();

// VAPID keys for web-push
// Note: These keys are not in the repository for security reasons.
// You will need to generate your own VAPID keys and set them as environment variables.
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BOA0NjzLhlXvX05nWd0Q7MrDE3A8zSvUGKH-aQ0_cejhmWI7BRCdUFALsckKWHCol11QVhcifANZwvOSNdnnmNI',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};
if (vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
} else {
    console.warn('VAPID private key not found. Push notifications will be disabled.');
}


app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors()); // Enable CORS for all routes

// News API endpoint
app.get('/api/news', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'News API key not configured' });
    }
    const response = await fetch(`https://newsapi.org/v2/top-headlines?language=en&pageSize=30&apiKey=${apiKey}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// User authentication endpoints
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!admin.apps.length) return res.status(500).json({ ok: false, message: 'Firebase not initialized' });
    try {
        await admin.auth().createUser({
            uid: username,
            password: password,
        });
        res.json({ ok: true });
    } catch (error) {
        res.status(400).json({ ok: false, message: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!admin.apps.length) return res.status(500).json({ ok: false, message: 'Firebase not initialized' });
    try {
        // This is a simplified login. In a real app, you'd verify the password.
        const userRecord = await admin.auth().getUserByUid(username);
        const token = await admin.auth().createCustomToken(userRecord.uid);
        res.json({ ok: true, token, isAdmin: false });
    } catch (error) {
        res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }
});

app.post('/api/verify', async (req, res) => {
    const { token } = req.body;
    if (!admin.apps.length) return res.status(500).json({ ok: false, message: 'Firebase not initialized' });
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        res.json({ ok: true, username: decodedToken.uid, isAdmin: false });
    } catch (error) {
        res.status(401).json({ ok: false, message: 'Invalid token' });
    }
});

app.post('/api/login-activity', async (req, res) => {
    const { username, ts } = req.body;
    if (!admin.apps.length) return res.status(500).json({ ok: false, message: 'Firebase not initialized' });
    try {
        const loginRef = db.collection('logins').doc();
        await loginRef.set({
            username,
            timestamp: new Date(ts)
        });
        const snapshot = await db.collection('logins').get();
        res.json({ totalLogins: snapshot.size, source: 'server' });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Failed to record login' });
    }
});


// Push notification endpoint
app.post('/save-subscription', async (req, res) => {
  if (!vapidKeys.privateKey) return res.status(500).json({ error: 'VAPID keys not configured' });
  try {
    const subscription = req.body;
    console.log('Received subscription:', subscription);
     // In a real app, you'd save this to a database associated with a user
    const payload = JSON.stringify({ title: 'Zawadi Intel', body: 'You will now receive notifications for new articles.' });
    await webpush.sendNotification(subscription, payload);
    res.status(201).json({ message: 'Subscription saved.' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
