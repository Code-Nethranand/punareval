export interface Subject {
  id: string;
  code: string;
  name: string;
  semester: number;
  marks: number;
  fee: number;
  credits: number;
}

export interface User {
  id: string;
  usn: string;
  name: string;
  email: string;
}

export interface PaymentDetails {
  id: string;
  orderId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionId?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevaluationRequest {
  id: string;
  userId: string;
  subjects: Subject[];
  paymentId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}
