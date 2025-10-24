import { useState } from 'react';
import { useCreateToken, CreateTokenDto } from '../../api/payneu-api';


interface Token {
  id: string;
  address: string;
  symbol: string;
  name: string;
  addedAt: string;
}

const TokenManagement = () => {
  const { trigger: createToken, isMutating } = useCreateToken();

  // Mock data for display while API returns void - using same addresses as in invoices
  const mockTokens: Token[] = [
    {
      id: '1',
      address: '0x35435120c2cf51f7f122f2b37bda3bbc686831de',
      symbol: 'mUSD',
      name: 'Mock USD',
      addedAt: '2024-01-15'
    },
    {
      id: '2',
      address: '0x8ec7d893f57b6a7c837bc93cfb4c01b80f58ba6b',
      symbol: 'BAZED',
      name: 'Baze Token',
      addedAt: '2024-01-14'
    }
  ];

  const [showAddForm, setShowAddForm] = useState(false);
  const [newToken, setNewToken] = useState({
    address: '',
    name: ''
  });

  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tokenData: CreateTokenDto = {
        address: newToken.address,
        name: newToken.name
      };

      await createToken(tokenData);
      setNewToken({ address: '', name: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create token:', error);
    }
  };

  const handleAddToWallet = async (token: Token) => {
    try {
      // Check if MetaMask is available
      if (typeof (window as any).ethereum !== 'undefined') {
        console.log('Adding token to wallet:', token);

        const result = await (window as any).ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: 18, // Assuming 18 decimals for both tokens
              image: '', // Optional token image URL
            },
          },
        });

        console.log('Add token result:', result);

        if (result) {
          alert(`${token.symbol} token has been added to your MetaMask wallet!`);
        }
      } else {
        alert('MetaMask is not installed. Please install MetaMask to add tokens to your wallet.');
      }
    } catch (error) {
      console.error('Failed to add token to wallet:', error);
      if (error instanceof Error) {
        console.log(error)
        alert(`Failed to add token: ${error.message}`);
      } else {
        alert('Failed to add token to wallet. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Token Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage accepted payment tokens</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span className="mr-2">{showAddForm ? '✕' : '+'}</span>
          {showAddForm ? 'Cancel' : 'Add Token'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Add New Token</h3>
          <form onSubmit={handleAddToken} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Address
              </label>
              <input
                type="text"
                value={newToken.address}
                onChange={(e) => setNewToken({ ...newToken, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="0x..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Name
              </label>
              <input
                type="text"
                value={newToken.name}
                onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="e.g., USD Coin"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isMutating}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {isMutating ? 'Adding...' : 'Add Token'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockTokens.map((token, index) => (
              <tr
                key={token.id}
                className="hover:bg-gray-50/50 transition-colors duration-150"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold mr-3">
                      {token.symbol.slice(0, 2)}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{token.symbol}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {token.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{token.address.slice(0, 6)}...{token.address.slice(-4)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleAddToWallet(token)}
                    className="inline-flex items-center px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-sm"
                  >
                    <span className="mr-1.5">+</span>
                    Add to Wallet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {mockTokens.map((token, index) => (
          <div
            key={token.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
                    {token.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900">{token.symbol}</div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1.5">Contract Address</div>
                <div className="text-xs text-gray-700 font-mono break-all">{token.address}</div>
              </div>
              <button
                onClick={() => handleAddToWallet(token)}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="mr-2">+</span>
                Add to Wallet
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenManagement;