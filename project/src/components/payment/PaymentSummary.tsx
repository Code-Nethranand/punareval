import React, { useState, useEffect } from 'react';
import { useRevaluationStore } from '../../store/useRevaluationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { formatPrice } from '../../lib/utils';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const PaymentSummary: React.FC = () => {
  const { selectedSubjects, calculateTotalFee } = useRevaluationStore();
  const { user, token, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated || !token) {
      localStorage.setItem('redirectAfterLogin', '/dashboard/payment');
      navigate('/login');
      toast.error('Please log in to continue');
    }
  }, [isAuthenticated, token, navigate]);

  useEffect(() => {
    // Load Cashfree SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Double check authentication
      if (!isAuthenticated || !token || !user?._id) {
        localStorage.setItem('redirectAfterLogin', '/dashboard/payment');
        navigate('/login');
        throw new Error('Please log in to make a payment');
      }

      // Check if subjects are selected
      if (selectedSubjects.length === 0) {
        throw new Error('Please select at least one subject');
      }

      // Calculate amount
      const amount = calculateTotalFee();
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount. Please select subjects first.');
      }

      // Prepare request data
      const subjectIds = selectedSubjects.map(s => s.id);
      const requestData = {
        amount: Number(amount),
        subjects: subjectIds
      };

      console.log("Creating payment order:", requestData);

      // Create payment order
      const { data } = await api.post('/payment/create-order', requestData);
      console.log("Payment order response:", data);

      if (!data?.success || !data?.payment_session_id) {
        console.error("Invalid payment response:", data);
        throw new Error(data?.message || 'Failed to create payment order');
      }

      // Initialize Cashfree
      const cashfree = (window as any).Cashfree({
        mode: "sandbox"  // hardcoded to sandbox for testing
      });

      // Configure checkout options
      const checkoutOptions = {
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self",
        onSuccess: async (data: any) => {
          console.log("Payment success:", data);
          try {
            await api.post('/payment/verify', { 
              orderId: data.order_id,
              paymentId: data.transaction_id 
            });
            toast.success('Payment successful!');
            navigate(`/payment/status?order_id=${data.order_id}`);
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        onError: (error: any) => {
          console.error("Payment error:", error);
          toast.error('Payment failed. Please try again.');
        }
      };

      // Open checkout
      await cashfree.checkout(checkoutOptions);

    } catch (error: any) {
      console.error("Payment error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Show error message
      let errorMessage = 'Failed to process payment';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (selectedSubjects.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-gray-500">Please select subjects for revaluation</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Payment Summary</h3>
        <div className="space-y-1">
          {selectedSubjects.map((subject) => (
            <div key={subject.id} className="flex justify-between text-sm">
              <span>{subject.name}</span>
              <span>{formatPrice(subject.fee)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Total Amount</span>
          <span>{formatPrice(calculateTotalFee())}</span>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Processing...' : `Pay ${formatPrice(calculateTotalFee())}`}
      </Button>
      <p className="text-xs text-gray-500 text-center">
        You will be redirected to a secure payment page
      </p>
    </div>
  );
};