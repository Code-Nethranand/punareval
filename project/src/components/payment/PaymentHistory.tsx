import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import { format } from 'date-fns';

interface Payment {
  _id: string;
  amount: number;
  status: string;
  subjects: Array<{
    id: string;
    code: string;
    name: string;
    fee: number;
  }>;
  createdAt: string;
}

export const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await api.get('/api/payments/history');
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold">Payment History</h2>
        <p className="text-gray-600">View your payment history and transaction details</p>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No payment records found
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="bg-white rounded-lg border p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Transaction ID: {payment._id.slice(0, 8)}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(payment.createdAt), 'PPpp')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    payment.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {payment.status}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Subjects</h4>
                {payment.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex justify-between text-sm"
                  >
                    <span>{subject.code} - {subject.name}</span>
                    <span>{formatPrice(subject.fee)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span>{formatPrice(payment.amount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
