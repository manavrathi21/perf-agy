import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App.jsx';
import './index.css';

// basename: import.meta.env.BASE_URL is Vite's own echo of vite.config.js's `base` (VITE_BASE_PATH) --
// '/perf-agent/' in prod (deploy-gateway), '/' for local dev -- so the router never hardcodes the path itself.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
