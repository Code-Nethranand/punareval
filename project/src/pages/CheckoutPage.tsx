import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentForm } from '../components/payment/PaymentForm';

interface Subject {
  id: string;
  code: string;
  name: string;
  fee: number;
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // This should be replaced with your actual selected subjects from your app state
  const selectedSubjects: Subject[] = [
    {
      id: '1',
      code: 'CS401',
      name: 'Data Structures',
      fee: 1000.00,
    },
    {
      id: '2',
      code: 'CS402',
      name: 'Operating Systems',
      fee: 1000.00,
    },
  ];

  const totalAmount = selectedSubjects.reduce((sum, subject) => sum + subject.fee, 0);

  const handlePaymentSuccess = () => {
    // Redirect to payment history or success page
    navigate('/payment-history');
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold">Checkout</h2>
          <p className="text-gray-600">Complete your payment to access the selected subjects</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <PaymentForm
          amount={totalAmount}
          subjects={selectedSubjects}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </div>
  );
};
