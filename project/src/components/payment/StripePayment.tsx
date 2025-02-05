import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useRevaluationStore } from '../../store/useRevaluationStore';
import { Button } from '../ui/Button';
import { createPaymentIntent } from '../../lib/api';
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const StripePayment: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { selectedSubjects, calculateTotalFee, addRequest } = useRevaluationStore();

  const handlePayment = async () => {
    try {
      setLoading(true);
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { clientSecret } = await createPaymentIntent(calculateTotalFee());
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        const newRequest = {
          id: paymentIntent.id,
          userId: '1',
          subjects: selectedSubjects,
          status: 'pending',
          totalFee: calculateTotalFee(),
          paymentStatus: 'completed',
          createdAt: new Date(),
        };

        addRequest(newRequest);
        toast.success('Payment successful!');
        window.location.href = '/dashboard/status';
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full"
      size="lg"
    >
      {loading ? 'Processing...' : 'Pay with Stripe'}
    </Button>
  );
};