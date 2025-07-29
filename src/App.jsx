import './App.css';
import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TrackingResult from './pages/TrackingResult';
import CreateShipment from './pages/CreateShipment';
import Chat from './components/Chat';
import ProtectedRoute from './components/ProctectedRoute';

const App = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const isTrackingPage = location.pathname.startsWith('/tracking/');
  const isHomePage = location.pathname === '/';

  return (
    <div className='min-h-screen bg-white-100'>
      <main className='container mx-auto'>
        <Header />

        {/* ✅ NO Router here */}
        <Routes>
          <Route
            path='/'
            element={<Home openChat={() => setIsChatOpen(true)} />}
          />

          <Route
            path='/admin'
            element={
              <ProtectedRoute>
                <Dashboard openChat={() => setIsChatOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path='/tracking/:trackingNumber'
            element={<TrackingResult />}
          />
          <Route path='/create-shipment' element={<CreateShipment />} />
        </Routes>

        {/* ✅ Only show general Chat when not on tracking page */}
        {!isTrackingPage && (
          <Chat
            isOpen={isChatOpen}
            setIsOpen={setIsChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}

        {/* ✅ Floating Button also only when not on tracking page */}
        {isHomePage && !isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className='fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-50'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
          </button>
        )}
      </main>
    </div>
  );
};

export default App;
