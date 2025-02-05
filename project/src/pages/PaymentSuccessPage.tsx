import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { CheckCircle } from 'lucide-react';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await api.get(`/payment/details/${orderId}`);
        setPaymentDetails(response.data);
      } catch (error) {
        console.error('Error fetching payment details:', error);
      }
    };

    if (orderId) {
      fetchPaymentDetails();
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Successful!</h2>
            {paymentDetails && (
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>Amount Paid: ₹{paymentDetails.amount}</p>
                <p>Order ID: {paymentDetails.order_id}</p>
                <p>Transaction ID: {paymentDetails.transaction_id}</p>
              </div>
            )}
            <div className="mt-6 space-y-4">
              <Button
                onClick={() => navigate('/dashboard/payments')}
                className="w-full"
              >
                View Payment History
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
