import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';

interface PaymentFormProps {
  amount: number;
  subjects: Array<{
    id: string;
    code: string;
    name: string;
    fee: number;
  }>;
  onSuccess: () => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    Cashfree: any;
  }
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  subjects,
  onSuccess,
  onError,
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    // Load Cashfree SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      // Create order
      const { data } = await api.post('/api/payment/create-order', {
        amount,
        subjects: subjects.map(s => s.id),
        userId: user?.usn
      });

      const { order_id, payment_session_id } = data;

      // Initialize Cashfree
      const cashfree = new window.Cashfree({
        mode: import.meta.env.VITE_CASHFREE_MODE || "TEST"
      });

      await cashfree.init({
        payment_session_id
      });

      // Handle payment events
      cashfree.on('payment_success', async (data: any) => {
        try {
          // Verify payment
          await api.post('/api/payment/verify', {
            orderId: order_id
          });
          onSuccess();
        } catch (error) {
          onError('Payment verification failed');
        }
      });

      cashfree.on('payment_error', (data: any) => {
        onError(data.message || 'Payment failed');
      });

    } catch (error: any) {
      onError(error.response?.data?.error || 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Selected Subjects</h3>
        {subjects.map((subject) => (
          <div key={subject.id} className="flex justify-between py-2">
            <span>{subject.code} - {subject.name}</span>
            <span>₹{subject.fee.toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t mt-4 pt-4 flex justify-between font-semibold">
          <span>Total Amount</span>
          <span>₹{amount.toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
      </Button>
    </div>
  );
};
