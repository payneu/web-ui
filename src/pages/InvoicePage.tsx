import { useParams } from 'react-router-dom';
import { useAccount, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseUnits } from 'viem';
import { useEffect, useState } from 'react';
import { useFindInvoiceById, useCheckPayerStatus, useSendInvoicePayment, useConvertThenSendStable } from '../api/payneu-api';


const InvoicePage = () => {
  const { id } = useParams();
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Contract interaction hooks
  const { writeContract, data: approveHash, isPending: isApprovePending } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveHash,
    confirmations: 2,
  });

  // Payment contract address
  const PAYMENT_CONTRACT_ADDRESS = '0x00c8c529ad8c6Dc36934927252c69df1C003F797';

  // Track which payment type is being processed
  const [pendingPaymentType, setPendingPaymentType] = useState<'stable' | 'asset' | null>(null);

  // Fetch invoice data
  const { data: invoiceData, error: invoiceError, isLoading: invoiceLoading } = useFindInvoiceById(id || '1');

  // Check payment status if wallet is connected
  const { data: paymentStatus, error: paymentError } = useCheckPayerStatus(
    {
      address: address || '',
      invoiceId: parseInt(id || '1')
    },
    {
      swr: {
        enabled: !!address && !!id
      }
    }
  );

  // Payment hooks for stable payment (invoice token)
  const { trigger: sendStablePayment, isMutating: isStablePaymentLoading, error: stablePaymentError } = useSendInvoicePayment({
    payer: address || '',
    invoiceId: parseInt(id || '1')
  });

  // Payment hooks for asset payment (BAZE token)
  const { trigger: sendAssetPayment, isMutating: isAssetPaymentLoading, error: assetPaymentError } = useConvertThenSendStable({
    payer: address || '',
    invoiceId: parseInt(id || '1'),
    assetAddress: '0x8ec7d893f57b6a7c837bc93cfb4c01b80f58ba6b' // BAZE token address
  });

  // Token mapping function
  const getTokenName = (tokenId: number | string) => {
    const id = typeof tokenId === 'string' ? parseInt(tokenId) : tokenId;
    switch (id) {
      case 1: return 'mUSD';
      case 2: return 'BAZE';
      case 3: return 'NEU';
      default: return 'USD';
    }
  };

  // Get token address for approval
  const getTokenAddress = (tokenName: string) => {
    switch (tokenName) {
      case 'mUSD': return '0x35435120c2cf51f7f122f2b37bda3bbc686831de';
      case 'BAZE': return '0x8ec7d893f57b6a7c837bc93cfb4c01b80f58ba6b';
      default: return '0x35435120c2cf51f7f122f2b37bda3bbc686831de';
    }
  };
console.log('invoiceData', invoiceData)
  // Process invoice data or use fallback
  const invoice = invoiceData?.data ? {
    id: (invoiceData.data as any).id?.toString() || id || '1',
    company: (invoiceData.data as any).merchant?.name || 'PayNeu Technology',
    amount: (invoiceData.data as any).amount?.toString() || '100',
    token: getTokenName((invoiceData.data as any).token_id || (invoiceData.data as any).tokenId) || 'mUSD',
    description: (invoiceData.data as any).details || (invoiceData.data as any).description || 'Payment Request',
    status: (invoiceData.data as any).status || 'pending'
  } : {
    id: id || '1',
    company: 'PayNeu Technology',
    amount: '100',
    token: 'mUSD',
    description: 'Payment Request',
    status: 'pending'
  };

  const handleConnectWallet = async () => {
    try {
      await open();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // Effect to handle payment after approval is confirmed
  useEffect(() => {
    const executePayment = async () => {
      if (isApproveConfirmed && pendingPaymentType) {
        try {
          if (pendingPaymentType === 'stable') {
            await sendStablePayment();
            alert(`Payment of ${invoice.amount} ${invoice.token} has been processed successfully!`);
          } else if (pendingPaymentType === 'asset') {
            await sendAssetPayment();
            alert(`Payment with BAZE tokens has been processed successfully!`);
          }
        } catch (error) {
          console.error('Payment failed:', error);
          alert('Payment failed. Please try again.');
        } finally {
          setPendingPaymentType(null);
        }
      }
    };

    executePayment();
  }, [isApproveConfirmed, pendingPaymentType, sendStablePayment, sendAssetPayment, invoice.amount, invoice.token]);

  // Get invoice status and payment options from payment status API (not invoice API)
  const invoiceStatus = (paymentStatus?.data as any)?.ui?.status || (invoiceData?.data as any)?.status || 'pending';
  const invoiceOptions = (paymentStatus?.data as any)?.ui?.options || {};

  // Check if we should show BAZE payment option based on API data
  const shouldShowBazeOption = invoiceOptions.invoiceToken === false &&
                               invoiceOptions.tokenOptions?.bazed === true;

  // Check if payment is completely unavailable (no invoice token, no BAZE balance)
  const isPaymentUnavailable = invoiceOptions.invoiceToken === false &&
                               invoiceOptions.tokenOptions?.bazed === false;

  // Check if invoice is open for payment - consider "pending" as open for payment
  const isInvoiceOpen = invoiceStatus === "open" || invoiceStatus === "pending";

  const handleApproveAndPay = async (tokenName: string, isAssetPayment: boolean = false) => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Set the payment type to track which payment to execute after approval
      setPendingPaymentType(isAssetPayment ? 'asset' : 'stable');

      // Step 1: Approve token spending
      const tokenAddress = getTokenAddress(tokenName);
      const amount = shouldShowBazeOption ? parseUnits(`${Number(invoice.amount) / 0.10}`, 18) : parseUnits(`${Number(invoice.amount)}`, 18) // Assuming 18 decimals for both tokens

      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }]
          }
        ],
        functionName: 'approve',
        args: [PAYMENT_CONTRACT_ADDRESS, amount]
      });
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Token approval failed. Please try again.');
      setPendingPaymentType(null);
    }
  };

  const handlePayInvoice = () => handleApproveAndPay(invoice.token);
  const handlePayWithBaze = () => handleApproveAndPay('BAZE', true);




  // Get button text based on current state
  const getButtonText = (tokenName: string, isPaymentLoading: boolean, isPendingThisPayment: boolean) => {
    if (isPaymentLoading) {
      return 'Payment Processing...';
    }
    if (isPendingThisPayment && isApproveConfirming) {
      return 'Waiting for Confirmation...';
    }
    if (isPendingThisPayment && isApprovePending) {
      return 'Approve in Wallet...';
    }

    const amount = (shouldShowBazeOption) ? Number(invoice.amount) / 0.10: invoice.amount

    return `Approve and Pay ${amount} ${tokenName}`;
  };



  // Show loading state
  if (invoiceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/30">
            <span className="text-2xl sm:text-3xl font-bold text-white">PN</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (invoiceError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/30">
            <span className="text-2xl sm:text-3xl font-bold text-white">PN</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
            <p className="text-gray-600 mb-6">The requested invoice could not be loaded.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/30 transform hover:scale-105 transition-transform duration-300">
            <span className="text-2xl sm:text-3xl font-bold text-white">PN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">PayNeu</h1>
          {/* <p className="text-sm text-gray-500">Secure Blockchain Payments</p> */}
        </div>

        <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 ${!isInvoiceOpen ? 'opacity-60' : ''} relative`}>
          {isConnected && isInvoiceOpen && (
            <div className="absolute top-4 right-4">
              <div className="relative group">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="absolute right-0 top-10 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-xl">
                  {address?.slice(0, 10)}...{address?.slice(-8)}
                  <div className="absolute top-0 right-2 transform -translate-y-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </div>
          )}
          <div className="text-center mb-6">
            <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isInvoiceOpen ? 'text-gray-900' : 'text-gray-500'}`}>
              Payment Request
            </h2>
            <div className={`inline-block px-4 py-2 rounded-lg mb-4 ${isInvoiceOpen ? 'bg-primary-50 border border-primary-200' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isInvoiceOpen ? 'text-gray-600' : 'text-gray-400'}`}>
                {invoice.company}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Amount Due</p>
              <p className={`text-3xl sm:text-4xl font-bold ${isInvoiceOpen ? 'text-primary-600' : 'text-gray-400'}`}>
                {invoice.amount} <span className="text-xl sm:text-2xl">{invoice.token}</span>
              </p>
            </div>
            <div className={`p-4 rounded-xl ${isInvoiceOpen ? 'bg-gradient-to-br from-gray-50 to-gray-100' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isInvoiceOpen ? 'text-gray-700' : 'text-gray-400'}`}>{invoice.description}</p>
            </div>
            {!isInvoiceOpen && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">
                  This invoice is no longer available for payment.
                </p>
              </div>
            )}
          </div>

          {isInvoiceOpen && !isConnected ? (
            <div className="space-y-3">
              <button
                onClick={handleConnectWallet}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transform hover:-translate-y-0.5"
              >
                Connect Wallet
              </button>
            </div>
          ) : isInvoiceOpen && isConnected ? (
            <div className="space-y-4">
              {/* Payment Error Display */}
              {(stablePaymentError || assetPaymentError) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">❌</span>
                    <p className="text-sm text-red-700 font-medium">
                      Payment failed. Please try again.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-gray-900">{invoice.amount} {invoice.token}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Merchant:</span>
                    <span className="font-semibold text-gray-900 truncate ml-2">{invoice.company}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {isPaymentUnavailable ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">❌</div>
                      <h3 className="text-sm font-bold text-red-800 mb-2">Payment Not Available</h3>
                      <p className="text-xs text-red-700">
                        You don't have sufficient balance in {invoice.token} or BAZE tokens to complete this payment.
                      </p>
                    </div>
                  </div>
                ) : shouldShowBazeOption ? (
                  <>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                      <p className="text-xs text-orange-700">
                        ⚠️ Payment with {invoice.token} is not possible. You can pay with BAZE instead. 1 mUSD = 10 BAZE
                      </p>
                    </div>
                    <button
                      onClick={handlePayWithBaze}
                      disabled={isAssetPaymentLoading || isApprovePending || isApproveConfirming || (pendingPaymentType === 'asset')}
                      className={`w-full font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                        (isAssetPaymentLoading || isApprovePending || isApproveConfirming || (pendingPaymentType === 'asset'))
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                          : 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white shadow-secondary-500/30'
                      }`}
                    >
                      {getButtonText('BAZE', isAssetPaymentLoading, pendingPaymentType === 'asset')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handlePayInvoice}
                    disabled={isStablePaymentLoading || isApprovePending || isApproveConfirming || (pendingPaymentType === 'stable')}
                    className={`w-full font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                      (isStablePaymentLoading || isApprovePending || isApproveConfirming || (pendingPaymentType === 'stable'))
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white shadow-secondary-500/30'
                    }`}
                  >
                    {getButtonText(invoice.token, isStablePaymentLoading, pendingPaymentType === 'stable')}
                  </button>
                )}
                <button
                  onClick={() => disconnect()}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 text-sm sm:text-base"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              🔒 Powered by PayNeu • Secure blockchain payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;