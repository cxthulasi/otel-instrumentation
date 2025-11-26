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

  // === DEMONSTRATION: Baggage and Tracestate Headers ===
  // These headers are added unconditionally for demonstration purposes
  // They are part of W3C Trace Context specification for distributed tracing

  // Baggage: Used to propagate user-defined key-value pairs across service boundaries
  // Format: key1=value1,key2=value2
  config.headers['baggage'] = 'userId=demo-user-123,sessionId=session-abc-456,environment=development';
  console.log('Manually adding baggage header');

  // Tracestate: Used to propagate vendor-specific trace information
  // Format: vendor1=value1,vendor2=value2
  config.headers['tracestate'] = 'coralogix=demo-state-value,custom=frontend-propagated';
  console.log('Manually adding tracestate header');

  // === END DEMONSTRATION ===

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

// ============================================================
// MANUAL INSTRUMENTATION DEMO API FUNCTIONS
// ============================================================

export const fetchDemoIndex = async () => {
  const response = await api.get('/api/demo');
  return response.data;
};

export const fetchDemoCustomSpans = async () => {
  const response = await api.get('/api/demo/custom-spans');
  return response.data;
};

export const fetchDemoSpanEvents = async () => {
  const response = await api.get('/api/demo/span-events');
  return response.data;
};

export const fetchDemoErrorHandling = async (shouldFail: boolean = false) => {
  const response = await api.get(`/api/demo/error-handling${shouldFail ? '?fail=true' : ''}`);
  return response.data;
};

export const fetchDemoContextPropagation = async () => {
  const response = await api.get('/api/demo/context-propagation');
  return response.data;
};

export const fetchDemoBaggage = async () => {
  const response = await api.get('/api/demo/baggage');
  return response.data;
};
