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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Token Management</h1>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Add New Token</h3>
          <form onSubmit={handleAddToken} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Address
              </label>
              <input
                type="text"
                value={newToken.address}
                onChange={(e) => setNewToken({ ...newToken, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0x..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newToken.name}
                onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., USD Coin"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isMutating}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {isMutating ? 'Adding...' : 'Add Token'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockTokens.map((token) => (
              <tr key={token.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {token.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {token.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {token.address.slice(0, 10)}...{token.address.slice(-8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => handleAddToWallet(token)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
                  >
                    Add to Wallet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokenManagement;