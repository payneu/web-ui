import { Link } from 'react-router-dom';
import { WalletButton } from '../components/WalletButton';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">PN</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">PayNeu</h1>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <div className="relative inline-block mb-8 sm:mb-10">
            <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary-500/30 transform hover:scale-105 transition-transform duration-300">
              <span className="text-3xl sm:text-4xl font-bold text-white">PN</span>
            </div>
            {/* <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div> */}
          </div>

          <h1 className="text-4xl font-extrabold sm:text-6xl lg:text-7xl mb-6 sm:mb-8 px-4">
            <span className="bg-gradient-to-r from-gray-900 via-primary-800 to-primary-600 bg-clip-text text-transparent">
              Welcome to PayNeu
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-10 sm:mb-14 max-w-3xl mx-auto px-4 leading-relaxed">
            Secure blockchain-based payment solutions for modern businesses
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 mb-16 sm:mb-24">
            <Link
              to="/admin"
              className="group w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-200 text-base sm:text-lg text-center shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                Go to Admin Dashboard
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            <Link
              to="/admin/invoices"
              className="group w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-10 rounded-xl transition-all duration-200 text-base sm:text-lg text-center border-2 border-gray-200 hover:border-primary-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              View Sample Invoice
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <Link to="/admin/invoices" className="group bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Fast and Easy Invoices</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Easily create invoice to quickly accept payments in crypto.</p>
          </Link>

          <Link to="/admin/tokens" className="group bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-secondary-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="w-14 h-14 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-secondary-500/20 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🪙</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Auto-swap Tokens for Payments</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">We convert convertible assets for you.</p>
          </Link>

          <Link to="/admin/faucet" className="group bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🚰</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Token Faucet</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Mint test tokens for development and testing purposes.</p>
          </Link>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-xs font-bold text-white">PN</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">PayNeu</span>
            </div>
            <p className="text-sm sm:text-base text-gray-600">&copy; 2025 PayNeu. All rights reserved.</p>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">Built by @sleepbuildrun</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;