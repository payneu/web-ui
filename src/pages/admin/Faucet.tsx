import { useState } from 'react';
import { MintTokenParams } from '../../api/payneu-api';


const Faucet = () => {
  const [mintForm, setMintForm] = useState({
    to: '',
    amount: '',
    tokenAddress: '0x35435120c2cf51f7f122f2b37bda3bbc686831de' // Default to mUSD token
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const availableTokens = [
    { name: 'mUSD', address: '0x35435120c2cf51f7f122f2b37bda3bbc686831de' },
    { name: 'BAZE', address: '0x8ec7d893f57b6a7c837bc93cfb4c01b80f58ba6b' }
  ];

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMintError(null);
    setSuccessMessage(null);

    try {
      const mintParams: MintTokenParams = {
        to: mintForm.to,
        amount: parseFloat(mintForm.amount) || 0,
        tokenAddress: mintForm.tokenAddress
      };

      // Call the API directly since the generated hook structure is complex
      const response = await fetch(`http://localhost:3000/token/faucet?to=${encodeURIComponent(mintParams.to)}&amount=${mintParams.amount}&tokenAddress=${encodeURIComponent(mintParams.tokenAddress)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to mint tokens: ${response.status}`);
      }

      setSuccessMessage(`Successfully minted ${mintForm.amount} tokens to ${mintForm.to}`);
      setMintForm({ to: '', amount: '', tokenAddress: availableTokens[0].address });
    } catch (error) {
      console.error('Failed to mint tokens:', error);
      setMintError(error instanceof Error ? error.message : 'Failed to mint tokens');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Token Faucet</h1>
        <p className="mt-2 text-gray-600">Mint tokens for testing purposes</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {mintError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{mintError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Mint Tokens</h3>
        <form onSubmit={handleMint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To (Address)
            </label>
            <input
              type="text"
              value={mintForm.to}
              onChange={(e) => setMintForm({ ...mintForm, to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0x..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={mintForm.amount}
              onChange={(e) => setMintForm({ ...mintForm, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token (To mint)
            </label>
            <select
              value={mintForm.tokenAddress}
              onChange={(e) => setMintForm({ ...mintForm, tokenAddress: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {availableTokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-secondary-500 hover:bg-secondary-600 text-white'
            }`}
          >
            {isSubmitting ? 'Minting...' : 'Mint Tokens'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Faucet;