
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { supabase } from '../public/js/supabase-client.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
