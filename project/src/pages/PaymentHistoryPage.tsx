import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PaymentDetails } from '../types';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { Clock, CheckCircle, XCircle, RefreshCw, FileText } from 'lucide-react';

export const PaymentHistoryPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const { token } = useAuthStore();

  const fetchPayments = async () => {
    try {
      console.log('Fetching payment history...');
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/payment/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Payment history response:', response.data);
      setPayments(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching payment history:', err);
      setError(err.response?.data?.message || 'Failed to load payment history. Please try again later.');
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPayments();
    }
  }, [token]);

  const refreshPaymentStatus = async (paymentId: string) => {
    try {
      setRefreshing(paymentId);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/payment/refresh-status`,
        { paymentId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const updatedPayment = response.data;
      setPayments(payments.map(p => 
        p.id === updatedPayment.id ? updatedPayment : p
      ));
      toast.success('Payment status updated');
    } catch (err: any) {
      console.error('Error refreshing payment status:', err);
      toast.error('Failed to refresh payment status');
    } finally {
      setRefreshing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'processed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'processing':
        return <Clock className="w-6 h-6 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 animate-pulse';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="text-red-500 text-lg font-medium">{error}</div>
        <Button onClick={() => fetchPayments()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Login</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to view payment history.</p>
        <Button onClick={() => window.location.href = '/login'}>
          Login
        </Button>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Payment History</h2>
        <p className="text-gray-600 mb-6">You haven't made any payments yet.</p>
        <Button onClick={() => window.location.href = '/dashboard/apply'}>
          Apply for Revaluation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Payment History</h2>
            <p className="text-gray-600">View and track all your revaluation payments</p>
          </div>
          <Button onClick={() => fetchPayments()} variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh All</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(payment.status)}
                  <div>
                    <h3 className="font-medium">Order #{payment.orderId}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshPaymentStatus(payment.id)}
                    disabled={refreshing === payment.id}
                    className="flex items-center space-x-1"
                  >
                    {refreshing === payment.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Refreshing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <span className="ml-2 font-medium">{formatPrice(payment.amount)}</span>
                </div>
                {payment.transactionId && (
                  <div>
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="ml-2 font-mono">{payment.transactionId}</span>
                  </div>
                )}
                {payment.paymentMethod && (
                  <div>
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="ml-2">{payment.paymentMethod}</span>
                  </div>
                )}
                {payment.subjects && payment.subjects.length > 0 && (
                  <div className="col-span-2 mt-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>Subjects:</span>
                    </div>
                    <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {payment.subjects.map((subject) => (
                        <div key={subject.id} className="text-sm">
                          {subject.code} - {subject.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
