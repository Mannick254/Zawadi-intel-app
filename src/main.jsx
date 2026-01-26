import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { supabase } from "./supabaseClient"; // your Supabase client setup

// Utility: convert base64 VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Utility: convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
}

// Save subscription directly into Supabase
async function saveSubscription(subscription) {
  const endpoint = subscription.endpoint;
  const p256dh = arrayBufferToBase64(subscription.getKey("p256dh"));
  const auth = arrayBufferToBase64(subscription.getKey("auth"));

  const { error } = await supabase
    .from("subscriptions")
    .insert([{ endpoint, p256dh, auth }]);

  if (error) {
    console.error("❌ Error saving subscription:", error);
  } else {
    console.log("✅ Subscription saved to Supabase");
  }
}

// Register Service Worker + Push Subscription
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      console.log("✅ ServiceWorker registered with scope:", registration.scope);

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("❌ VAPID public key missing. Check your .env file.");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log("📡 Push subscription created:", subscription);

      // Save subscription directly to Supabase
      await saveSubscription(subscription);
    } catch (error) {
      console.error("❌ ServiceWorker registration or subscription failed:", error);
    }
  });
}

// ✅ Mount App with BrowserRouter so Routes in App.jsx work
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
