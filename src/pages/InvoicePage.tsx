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
      default: return 'Unknown';
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">PN</span>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (invoiceError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">PN</span>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-red-600 mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Invoice Not Found</h2>
            <p className="text-gray-600 mb-4">The requested invoice could not be loaded.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">PN</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PayNeu</h1>
        </div>

        <div className={`bg-white rounded-lg shadow-lg p-6 border border-gray-200 ${!isInvoiceOpen ? 'opacity-60' : ''}`}>
          <div className="text-center mb-6">
            <h2 className={`text-xl font-semibold mb-2 ${isInvoiceOpen ? 'text-gray-900' : 'text-gray-500'}`}>
              Payment Request
            </h2>
            <p className={isInvoiceOpen ? 'text-gray-600' : 'text-gray-400'}>
              {invoice.company} is requesting payment of{' '}
              <span className={`font-semibold ${isInvoiceOpen ? 'text-primary-600' : 'text-gray-400'}`}>
                {invoice.amount} {invoice.token}
              </span>
            </p>
            <div className={`mt-4 p-3 rounded-md ${isInvoiceOpen ? 'bg-gray-50' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isInvoiceOpen ? 'text-gray-700' : 'text-gray-400'}`}>{invoice.description}</p>
            </div>
            {!isInvoiceOpen && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  This invoice is no longer available for payment.
                </p>
              </div>
            )}
          </div>

          {isInvoiceOpen && !isConnected ? (
            <div className="space-y-3">
              <button
                onClick={handleConnectWallet}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          ) : isInvoiceOpen && isConnected ? (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  ✅ Wallet Connected
                </p>
                <p className="text-xs text-green-600 font-mono mt-1">
                  {address?.slice(0, 10)}...{address?.slice(-8)}
                </p>
                {paymentError && (
                  <p className="text-xs text-red-600 mt-1">
                    Unable to check payment status
                  </p>
                )}
                {paymentStatus?.data ? (
                  <p className="text-xs text-blue-600 mt-1">
                    Payment status checked
                  </p>
                ) : null}
              </div>

              {/* Payment Error Display */}
              {(stablePaymentError || assetPaymentError) && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-700">
                    ❌ Payment failed. Please try again.
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{invoice.amount} {invoice.token}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium">{invoice.company}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {isPaymentUnavailable ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-center">
                      <div className="text-red-600 mb-2">❌</div>
                      <h3 className="text-sm font-medium text-red-800 mb-2">Payment Not Available</h3>
                      <p className="text-sm text-red-700">
                        You don't have sufficient balance in {invoice.token} or BAZE tokens to complete this payment.
                      </p>
                    </div>
                  </div>
                ) : shouldShowBazeOption ? (
                  <>
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-3">
                      <p className="text-sm text-orange-700">
                        ⚠️ Payment with {invoice.token} is not possible. You can pay with BAZE instead. 1 mUSD = 10 BAZE
                      </p>
                    </div>
                    <button
                      onClick={handlePayWithBaze}
                      disabled={isAssetPaymentLoading || isApprovePending || isApproveConfirming || (pendingPaymentType === 'asset')}
                      className={`w-full font-medium py-3 px-4 rounded-md transition-colors ${
                        (isAssetPaymentLoading || isApprovePending || isApproveConfirming || (pendingPaymentType === 'asset'))
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-secondary-500 hover:bg-secondary-600 text-white'
                      }`}
                    >
                      {getButtonText('BAZE', isAssetPaymentLoading, pendingPaymentType === 'asset')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handlePayInvoice}
                    disabled={isStablePaymentLoading || isApprovePending || isApproveConfirming || (pendingPaymentType === 'stable')}
                    className={`w-full font-medium py-3 px-4 rounded-md transition-colors ${
                      (isStablePaymentLoading || isApprovePending || isApproveConfirming || (pendingPaymentType === 'stable'))
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-secondary-500 hover:bg-secondary-600 text-white'
                    }`}
                  >
                    {getButtonText(invoice.token, isStablePaymentLoading, pendingPaymentType === 'stable')}
                  </button>
                )}
                <button
                  onClick={() => disconnect()}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          ) : !isInvoiceOpen ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Payment is no longer available for this invoice.</p>
            </div>
          ) : null}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Powered by PayNeu • Secure payments on blockchain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;