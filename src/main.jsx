
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Header from './components/header'; // Import the Header component

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Header />
    <App />
  </React.StrictMode>
);
