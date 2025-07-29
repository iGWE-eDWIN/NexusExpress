import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ShipmentProvider } from './context/ShipmentProvider.jsx';
import { AuthProvider } from './context/AuthProvider.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ShipmentProvider>
        <App />
      </ShipmentProvider>
    </AuthProvider>
  </BrowserRouter>
);
