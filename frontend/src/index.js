import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App';

// Desktop-only access check
const isMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

const isSmallScreen = () => {
  return window.innerWidth < 768;
};

// Check if access should be blocked
if (isMobile() || isSmallScreen()) {
  // Show mobile block message
  document.body.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: white;
      font-family: 'Inter', sans-serif;
      padding: 2rem;
      z-index: 9999;
    ">
      <div>
        <div style="font-size: 3rem; margin-bottom: 1rem;">💻</div>
        <h1 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Desktop Access Only</h1>
        <p style="font-size: 1rem; opacity: 0.9; line-height: 1.6;">
          This attendance management system is designed exclusively for desktop and laptop computers. 
          Mobile access is not supported for security and functionality reasons.
        </p>
        <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
          Please access this system from a desktop or laptop computer.
        </p>
      </div>
    </div>
  `;
} else {
  // Render the app for desktop users
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </React.StrictMode>
  );
} 