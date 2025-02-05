import React, { useState } from 'react';
import { useRevaluationStore } from '../../store/useRevaluationStore';
import { Button } from '../ui/Button';
import { createPaymentOrder } from '../../lib/api';
import { toast } from 'react-hot-toast';

declare const Cashfree: any;

export const CashfreePayment: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { selectedSubjects, calculateTotalFee, addRequest } = useRevaluationStore();

  const handlePayment = async () => {
    try {
      setLoading(true);
      const amount = calculateTotalFee();
      
      const { order_id, payment_session_id } = await createPaymentOrder(amount);

      const cashfree = new Cashfree({
        mode: import.meta.env.VITE_CASHFREE_MODE || "TEST"
      });

      cashfree.init({
        payment_session_id: payment_session_id
      });

      const paymentResponse = await new Promise((resolve, reject) => {
        cashfree.on('payment_success', (data: any) => resolve(data));
        cashfree.on('payment_error', (data: any) => reject(data));
      });

      const newRequest = {
        id: order_id,
        userId: '1',
        subjects: selectedSubjects,
        status: 'pending',
        totalFee: amount,
        paymentStatus: 'completed',
        createdAt: new Date(),
      };

      addRequest(newRequest);
      toast.success('Payment successful!');
      window.location.href = '/dashboard/status';
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || selectedSubjects.length === 0}
      className="w-full"
    >
      {loading ? 'Processing...' : `Pay ₹${calculateTotalFee()}`}
    </Button>
  );
};
