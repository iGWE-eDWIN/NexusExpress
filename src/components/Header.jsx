import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu state
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md border-b border-gray-300 py-1'
          : 'bg-white shadow-md border-b '
      }`}
    >
      <div className='container mx-auto px-3 py-2'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <Link
            to='/'
            className='flex items-center space-x-3'
            onClick={closeMenu}
          >
            <div className='bg-gray-800 p-2 rounded-lg'>
              <Truck className='w-8 h-8 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>NexusExpress</h1>
              <p className='text-sm text-gray-600'>Global Logistics Platform</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <nav className='hidden md:flex items-center space-x-6'>
            <Link
              to='/'
              className='text-gray-700 hover:text-black-600 transition-colors'
            >
              Track Shipment
            </Link>
            {isAuthenticated && (
              <Link
                to='/create-shipment'
                className='text-gray-700 hover:text-black-600 transition-colors'
              >
                Create Shipment
              </Link>
            )}

            {isAuthenticated ? (
              <div className='flex items-center space-x-4'>
                <Link
                  to='/admin'
                  className='flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg transition-colors hover:bg-blue-200'
                >
                  <Shield className='w-4 h-4' />
                  <span>Admin Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className='flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg transition-colors hover:bg-red-200'
                >
                  <LogOut className='w-4 h-4' />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to='/admin'
                className='flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg transition-colors hover:bg-gray-200'
              >
                <Shield className='w-4 h-4' />
                <span>Login</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className='md:hidden'>
            <button
              onClick={toggleMenu}
              className='p-2 rounded-lg hover:bg-gray-100'
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
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className='md:hidden mt-4 space-y-4'>
            <Link
              to='/'
              onClick={closeMenu}
              className='block text-gray-700 hover:text-black-600'
            >
              Track Shipment
            </Link>
            {isAuthenticated && (
              <Link
                to='/create-shipment'
                onClick={closeMenu}
                className='block text-gray-700 hover:text-black-600'
              >
                Create Shipment
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to='/admin'
                  onClick={closeMenu}
                  className='block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg'
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className='w-full text-left px-4 py-2 bg-red-100 text-red-700 rounded-lg'
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to='/admin'
                onClick={closeMenu}
                className='block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg'
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
