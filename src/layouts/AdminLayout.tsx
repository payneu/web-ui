import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { WalletButton } from '../components/WalletButton';

const AdminLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Invoices', href: '/admin/invoices', icon: '📄' },
    { name: 'Faucet', href: '/admin/faucet', icon: '🚰' },
    { name: 'Tokens', href: '/admin/tokens', icon: '🪙' },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-primary-800 to-primary-900 shadow-xl">
        <div className="flex items-center justify-center h-16 px-4 bg-primary-900/50 backdrop-blur-sm border-b border-primary-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <span className="text-sm font-bold text-white">PN</span>
            </div>
            <h1 className="text-lg font-bold text-white">PayNeu Admin</h1>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm'
                    : 'text-primary-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-primary-700/50">
          <div className="text-xs text-primary-200 text-center">v1.0.0</div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden w-64 bg-gradient-to-b from-primary-800 to-primary-900 shadow-2xl transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-primary-900/50 backdrop-blur-sm border-b border-primary-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <span className="text-sm font-bold text-white">PN</span>
            </div>
            <h1 className="text-lg font-bold text-white">PayNeu Admin</h1>
          </div>
          <button
            onClick={closeMobileMenu}
            className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-all duration-200"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeMobileMenu}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm'
                    : 'text-primary-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button - only visible on mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </h2>
              </div>
            </div>
            <WalletButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;