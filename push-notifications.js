// push-notifications.js
// Backend service for sending push notifications to subscribed users

const webpush = require("web-push");

// Set VAPID details for authentication
webpush.setVapidDetails(
  "mailto:admin@zawadiintel.com",
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

/**
 * Send a notification to a specific subscription
 * @param {Object} subscription - Push subscription object
 * @param {String} title - Notification title
 * @param {String} body - Notification body text
 */
async function sendNotification(subscription, title, body) {
  const payload = JSON.stringify({
    title: title || "Zawadi Intel Update",
    body: body || "New story just published on Zawadi Intel!"
  });

  try {
    await webpush.sendNotification(subscription, payload);
    console.log("Notification sent successfully");
  } catch (error) {
    if (error.statusCode === 410) {
      console.log("Subscription expired, removing from database");
      // TODO: Remove expired subscription from your database
    } else {
      console.error("Error sending notification:", error);
    }
  }
}

/**
 * Send notifications to all subscribed users
 * @param {Array} subscriptions - Array of subscription objects from your database
 * @param {String} title - Notification title
 * @param {String} body - Notification body text
 */
async function sendNotificationToAll(subscriptions, title, body) {
  const payload = JSON.stringify({
    title: title || "Zawadi Intel Update",
    body: body || "New story just published on Zawadi Intel!"
  });

  const promises = subscriptions.map(subscription =>
    webpush.sendNotification(subscription, payload)
      .catch(error => {
        if (error.statusCode === 410) {
          console.log("Subscription expired, should be removed");
          // TODO: Remove expired subscription from your database
        } else {
          console.error("Error sending notification:", error);
        }
      })
  );

  await Promise.all(promises);
  console.log(`Sent notifications to ${subscriptions.length} users`);
}

/**
 * Example Express.js route to save subscriptions
 * POST /save-subscription
 * Body: { subscription object from client }
 */
function setupSubscriptionRoute(app) {
  // Store subscriptions in memory (use a database in production)
  let subscriptions = [];

  app.post("/save-subscription", (req, res) => {
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Invalid subscription" });
    }

    // Check if subscription already exists
    const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!exists) {
      subscriptions.push(subscription);
      console.log("New subscription saved:", subscription.endpoint);
    }

    res.status(201).json({ success: true, message: "Subscription saved" });
  });

  app.post("/send-notification", async (req, res) => {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" });
    }

    try {
      await sendNotificationToAll(subscriptions, title, body);
      res.json({ success: true, message: `Sent to ${subscriptions.length} users` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = {
  sendNotification,
  sendNotificationToAll,
  setupSubscriptionRoute,
  webpush
};
