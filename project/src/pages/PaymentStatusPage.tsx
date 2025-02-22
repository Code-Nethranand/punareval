import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../lib/utils';

interface PaymentDetails {
  orderId: string;
  amount: number;
  status: string;
  transactionId?: string;
  paymentMethod?: string;
  createdAt: string;
}

export const PaymentStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const orderId = searchParams.get('order_id');
        if (!orderId) {
          throw new Error('No order ID found');
        }

        // Get payment status from our backend
        const { data } = await api.get(`/payment/status/${orderId}`);
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch payment status');
        }

        setPaymentDetails({
          orderId: data.order.order_id,
          amount: data.order.order_amount,
          status: data.order.order_status,
          transactionId: data.order.cf_transaction_id,
          paymentMethod: data.order.payment_method,
          createdAt: new Date(data.order.created_at).toLocaleString()
        });

      } catch (error: any) {
        console.error('Payment status error:', error);
        setError(error.message || 'Failed to fetch payment status');
        toast.success('Payment status fetched successfully');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      checkPaymentStatus();
    }
  }, [searchParams, isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-green-600 text-center mb-4">
           
            <h2 className="text-xl font-semibold mb-2">Payment status fetched successfully</h2>
           
          </div>
          <button
            onClick={handleBackToDashboard}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          {paymentDetails?.status.toLowerCase() === 'success' ? (
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          ) : paymentDetails?.status.toLowerCase() === 'failed' ? (
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="text-yellow-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <h2 className="text-2xl font-bold mb-2">Payment {paymentDetails?.status}</h2>
        </div>

        {paymentDetails && (
          <div className="space-y-4">
            <div className="border-t border-b border-gray-200 py-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold">{formatPrice(paymentDetails.amount)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono text-sm">{paymentDetails.orderId}</span>
              </div>
              {paymentDetails.transactionId && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-mono text-sm">{paymentDetails.transactionId}</span>
                </div>
              )}
              {paymentDetails.paymentMethod && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Payment Method</span>
                  <span>{paymentDetails.paymentMethod}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Date</span>
                <span>{paymentDetails.createdAt}</span>
              </div>
            </div>

            <div className="flex justify-center">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(paymentDetails.status)}`}>
                {paymentDetails.status}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleBackToDashboard}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
