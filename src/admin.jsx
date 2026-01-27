// src/admin.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminPage from './pages/AdminPage.jsx';

// ✅ Mount the AdminPage into the #admin-root div in admin.html
ReactDOM.createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode>
    <AdminPage />
  </React.StrictMode>
);
