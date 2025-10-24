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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-red-800">
                {error ? 'Failed to load invoices' : 'Failed to create invoice'}
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Please check your connection and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and track payment requests</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={isMutating}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
        >
          <span className="mr-2">{showCreateForm ? '✕' : '+'}</span>
          {isMutating ? 'Creating...' : showCreateForm ? 'Cancel' : 'Create Invoice'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Create New Invoice</h3>
          <form onSubmit={handleCreateInvoice} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Details
              </label>
              <input
                type="text"
                value={newInvoice.details}
                onChange={(e) => setNewInvoice({ ...newInvoice, details: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="e.g., Payment for services"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Token
              </label>
              <select
                value={newInvoice.token_id}
                onChange={(e) => setNewInvoice({ ...newInvoice, token_id: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                required
              >
                <option value={1}>Mock USD (mUSD)</option>
                <option value={2}>Baze Token (BAZE)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merchant
              </label>
              <select
                value={newInvoice.merchant_id}
                onChange={(e) => setNewInvoice({ ...newInvoice, merchant_id: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                required
              >
                <option value={1}>PayNeu Technology</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isMutating}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {isMutating ? 'Creating...' : 'Create Invoice'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading invoices...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment TX
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice, index) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50/50 transition-colors duration-150"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold">
                        #{invoice.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {invoice.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-medium">
                        {invoice.token}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {invoice.paymentTxHash ? (
                        <a
                          href={`https://sepolia.basescan.org/tx/${invoice.paymentTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-mono text-xs hover:underline"
                        >
                          {invoice.paymentTxHash.slice(0, 8)}...{invoice.paymentTxHash.slice(-6)}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        to={`/invoice/${invoice.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {invoices.map((invoice, index) => (
              <div
                key={invoice.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-700 text-xs font-bold">
                          #{invoice.id}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </div>
                      <div className="text-base font-bold text-gray-900">{invoice.description}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <div className="text-xs font-medium text-gray-500 mb-0.5">Amount</div>
                      <div className="text-sm text-gray-900 font-bold">{invoice.amount}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <div className="text-xs font-medium text-gray-500 mb-0.5">Token</div>
                      <div className="text-sm text-primary-700 font-semibold">{invoice.token}</div>
                    </div>
                  </div>
                  {invoice.paymentTxHash && (
                    <div className="bg-blue-50 rounded-lg p-2.5">
                      <div className="text-xs font-medium text-blue-700 mb-1">Payment Transaction</div>
                      <a
                        href={`https://sepolia.basescan.org/tx/${invoice.paymentTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-mono text-xs break-all hover:underline"
                      >
                        {invoice.paymentTxHash.slice(0, 10)}...{invoice.paymentTxHash.slice(-8)}
                      </a>
                    </div>
                  )}
                  <Link
                    to={`/invoice/${invoice.id}`}
                    className="block w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-center shadow-sm hover:shadow-md"
                  >
                    View Invoice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceManagement;