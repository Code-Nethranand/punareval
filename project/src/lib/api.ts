import axios from "axios";
import { RevaluationRequest, Subject } from "../types";
import { useAuthStore } from '../store/useAuthStore';

// Create axios instance with default config
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  timeout: 10000,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from auth store
    const token = useAuthStore.getState().getToken();
    
    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token found for request:', config.url);
    }

    // Add content type if not set
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Log request details
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? 'Bearer [HIDDEN]' : undefined
      },
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      console.error('Unauthorized request:', error.config.url);
      // Clear auth state if token is invalid
      useAuthStore.getState().logout();
    }

    // Log error response
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    return Promise.reject(error);
  }
);

// API Functions
export const fetchSubjects = async (): Promise<Subject[]> => {
  const { data } = await api.get("/subjects");
  return data;
};

export const createPaymentOrder = async (amount: number, subjects: string[]) => {
  const { data } = await api.post("/payment/create-order", {
    amount,
    subjects
  });
  return data;
};

export const recordPayment = async (orderId: string, amount: number, subjects: string[]) => {
  const { data } = await api.post("/payment/record", {
    orderId,
    amount,
    subjects
  });
  return data;
};

export const validateSubjects = async (subjects: Subject[]) => {
  const { data } = await api.post("/validate-subjects", { subjects });
  return data;
};

export const submitRevaluation = async (
  request: Omit<RevaluationRequest, "id" | "createdAt">
) => {
  const { data } = await api.post("/revaluation/submit", request);
  return data;
};

export const fetchRevaluationStatus = async (requestId: string) => {
  const { data } = await api.get(`/revaluation/status/${requestId}`);
  return data;
};
