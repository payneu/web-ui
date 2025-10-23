import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFindAllInvoice, useCreateInvoice, CreateInvoiceDto } from '../../api/payneu-api';


const InvoiceManagement = () => {
  const { data: invoicesData, error, mutate, isLoading } = useFindAllInvoice();
  const { trigger: createInvoice, isMutating, error: createError } = useCreateInvoice();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    details: '',
    amount: '',
    merchant_id: 1, // Default merchant ID
    token_id: 1 // Default token ID
  });

  // Token mapping function
  const getTokenName = (tokenId: number | string) => {
    const id = typeof tokenId === 'string' ? parseInt(tokenId) : tokenId;
    switch (id) {
      case 1: return 'mUSD';
      case 2: return 'BAZE';
      case 3: return 'NEU';
      default: return 'Unknown';
    }
  };

  // Process API data or use mock data
  const invoices = invoicesData?.data ?
    (Array.isArray(invoicesData.data) ? invoicesData.data : []).map((invoice: any) => ({
      id: invoice.id?.toString() || '',
      description: invoice.details || invoice.description || '',
      amount: invoice.amount?.toString() || '',
      token: invoice.token?.name || getTokenName(invoice.token_id || invoice.tokenId) || 'Unknown',
      status: invoice.status || 'pending',
      createdAt: invoice.created_at || invoice.createdAt || new Date().toISOString().split('T')[0],
      paymentTxHash: invoice.paymentTxHash || invoice.payment_tx_hash || null
    })) : [];

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const invoiceData: CreateInvoiceDto = {
        details: newInvoice.details,
        merchant_id: newInvoice.merchant_id,
        token_id: newInvoice.token_id,
        amount: parseFloat(newInvoice.amount)
      };

      await createInvoice(invoiceData);
      mutate(); // Refresh the invoices list
      setNewInvoice({ details: '', amount: '', merchant_id: 1, token_id: 1 });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {(error || createError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error ? 'Failed to load invoices' : 'Failed to create invoice'}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Please check your connection and try again.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={isMutating}
          className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          {isMutating ? 'Creating...' : 'Create New Invoice'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Create New Invoice</h3>
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details
              </label>
              <input
                type="text"
                value={newInvoice.details}
                onChange={(e) => setNewInvoice({ ...newInvoice, details: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token ID
              </label>
              <select
                value={newInvoice.token_id}
                onChange={(e) => setNewInvoice({ ...newInvoice, token_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value={1}>Mock USD (mUSD)</option>
                <option value={2}>Baze Token (BAZE)</option>
                <option value={3}>PayNeu Token (NEU)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Merchant ID
              </label>
              <select
                value={newInvoice.merchant_id}
                onChange={(e) => setNewInvoice({ ...newInvoice, merchant_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value={1}>PayNeu Technology</option>
                {/* <option value={2}>Merchant 2</option> */}
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isMutating}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {isMutating ? 'Creating...' : 'Create Invoice'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading invoices...</p>
          </div>
        ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Token
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment TX
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.token}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-secondary-100 text-secondary-800'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.paymentTxHash ? (
                    <a
                      href={`https://sepolia.basescan.org/tx/${invoice.paymentTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900 font-mono text-xs"
                    >
                      {invoice.paymentTxHash.slice(0, 10)}...{invoice.paymentTxHash.slice(-8)}
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">No TX</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Link
                    to={`/invoice/${invoice.id}`}
                    className="text-primary-600 hover:text-primary-900 font-medium"
                  >
                    View Invoice
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagement;