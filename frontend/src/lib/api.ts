import axios from 'axios';
import { getTraceContext } from './coralogix';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to ensure trace context propagation
api.interceptors.request.use((config) => {
  // Get the trace context from the window object if available
  if (typeof window !== 'undefined' && window.CoralogixRum) {
    try {
      const traceContext = window.CoralogixRum.getTraceContext?.();
      if (traceContext && traceContext.traceparent) {
        // Add traceparent header to the request
        config.headers['traceparent'] = traceContext.traceparent;
        console.log(`Manually adding traceparent header: ${traceContext.traceparent}`);
      }
    } catch (error) {
      console.error('Error getting trace context:', error);
    }
  }

  return config;
});

// API functions
export const fetchProducts = async () => {
  const response = await api.get('/api/products');
  return response.data;
};

export const fetchProduct = async (id: number) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await api.get('/api/users');
  return response.data;
};

export const fetchUser = async (id: number) => {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
};
