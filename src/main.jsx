import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { supabase } from "./supabaseClient"; 

// Global Styles
import "./css/styles.css";
import "./css/layout.css";
import "./css/theme.css";
import "./css/admin.css";
import "./css/article-base.css";
import "./css/article-components.css";
import "./css/article-interactive.css";
import "./css/clock-calendar.css";
import "./css/custom.css";
import "./css/kenyaupdate.css";
import "./css/template.css";
import "./css/widgets.css";

/* ===========================
   Utility Functions
   =========================== */

// Convert base64 VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// Convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
}

/* ===========================
   Supabase Subscription Save
   =========================== */
async function saveSubscription(subscription) {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized.");
    }

    const endpoint = subscription.endpoint;
    const p256dh = arrayBufferToBase64(subscription.getKey("p256dh"));
    const auth = arrayBufferToBase64(subscription.getKey("auth"));

    const { error } = await supabase
      .from("subscriptions")
      .insert([{ endpoint, p256dh, auth }]);

    if (error) {
      console.error("❌ Failed to save subscription:", error.message);
    } else {
      console.log("✅ Subscription saved:", endpoint);
    }
  } catch (err) {
    console.error("❌ Subscription save error:", err.message);
  }
}

/* ===========================
   Service Worker Registration
   =========================== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      console.log("✅ ServiceWorker registered:", registration.scope);

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("❌ Missing VAPID public key. Check your .env file.");
        return;
      }

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("ℹ️ Already subscribed:", existingSubscription.endpoint);
        await saveSubscription(existingSubscription);
        return;
      }

      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log("📡 New push subscription:", subscription.endpoint);
      await saveSubscription(subscription);
    } catch (error) {
      console.error("❌ ServiceWorker setup failed:", error);
    }
  });
}

/* ===========================
   Mount App
   =========================== */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
