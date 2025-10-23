import { Outlet, Link, useLocation } from 'react-router-dom';
import { WalletButton } from '../components/WalletButton';

const AdminLayout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Invoices', href: '/admin/invoices', icon: '📄' },
    { name: 'Tokens', href: '/admin/tokens', icon: '🪙' },
    { name: 'Faucet', href: '/admin/faucet', icon: '🚰' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex flex-col w-64 bg-primary-800">
        <div className="flex items-center justify-center h-16 px-4 bg-primary-900">
          <h1 className="text-xl font-bold text-white">PayNeu Admin</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
            </h2>
            <WalletButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;