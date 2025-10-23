import { Link } from 'react-router-dom';
import { WalletButton } from '../components/WalletButton';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-white">PN</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">PayNeu</h1>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-3xl font-bold text-white">PN</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl mb-6">
            Welcome to <span className="text-primary-600">PayNeu</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            [Placeholder for description - edit this content later]
          </p>

          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Secure blockchain-based payment solutions for modern businesses.
            Create invoices, manage tokens, and process payments with ease.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/admin"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-md transition-colors text-lg"
            >
              Go to Admin Dashboard
            </Link>

            <Link
              to="/invoice/1"
              className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-3 px-8 rounded-md transition-colors text-lg"
            >
              View Sample Invoice
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Management</h3>
            <p className="text-gray-600">Create and manage invoices with blockchain integration for secure payments.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🪙</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Token Management</h3>
            <p className="text-gray-600">Add and configure supported tokens for your payment infrastructure.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🚰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Token Faucet</h3>
            <p className="text-gray-600">Mint test tokens for development and testing purposes.</p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 PayNeu. All rights reserved.</p>
            <p className="mt-2 text-sm">Powered by blockchain technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;