// Import instrumentation at the top of the application
import './instrumentation';

import express from 'express';
import cors from 'cors';
import { trace, context, propagation, SpanStatusCode } from '@opentelemetry/api';

const app = express();
const PORT = process.env.PORT || 3001;

// Get the tracer
const tracer = trace.getTracer('cx-rum-backend', '1.0.0');

// Helper function to log span details
function logSpanDetails(span: any, operation: string) {
  const spanContext = span.spanContext();
  console.log(`\n🔷 Custom Span Created: ${operation}`);
  console.log('  - Trace ID:', spanContext.traceId);
  console.log('  - Span ID:', spanContext.spanId);
  console.log('  - Parent Span ID:', span.parentSpanId || 'None');
  return spanContext;
}

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to log trace context, baggage, and span details
app.use((req, _res, next) => {
  const traceParent = req.headers['traceparent'] as string;
  const baggage = req.headers['baggage'] as string;
  const traceState = req.headers['tracestate'] as string;

  console.log('\n=== Incoming Request ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('traceparent:', traceParent || 'NOT PROVIDED');
  console.log('baggage:', baggage || 'NOT PROVIDED');
  console.log('tracestate:', traceState || 'NOT PROVIDED');

  // Get the current span
  const currentSpan = trace.getActiveSpan();
  if (currentSpan) {
    const spanContext = currentSpan.spanContext();
    console.log('\n--- Active Span Context ---');
    console.log('Trace ID:', spanContext.traceId);
    console.log('Span ID:', spanContext.spanId);
    console.log('Trace Flags:', spanContext.traceFlags);
    console.log('Is Sampled:', (spanContext.traceFlags & 1) === 1);
    console.log('---------------------------');
  } else {
    console.log('⚠️  No active span found in middleware');
  }

  // Extract and log baggage
  const currentContext = context.active();
  const extractedBaggage = propagation.getBaggage(currentContext);
  if (extractedBaggage) {
    console.log('\n--- Baggage Items ---');
    extractedBaggage.getAllEntries().forEach(([key, entry]) => {
      console.log(`${key}: ${entry.value}`);
    });
    console.log('---------------------');
  }

  console.log('========================\n');
  next();
});

// Mock data
const products = [
  { id: 1, name: 'Product 1', price: 99.99, description: 'This is product 1' },
  { id: 2, name: 'Product 2', price: 149.99, description: 'This is product 2' },
  { id: 3, name: 'Product 3', price: 199.99, description: 'This is product 3' },
  { id: 4, name: 'Product 4', price: 249.99, description: 'This is product 4' },
  { id: 5, name: 'Product 5', price: 299.99, description: 'This is product 5' },
];

const users = [
  { id: 1, name: 'User 1', email: 'user1@example.com' },
  { id: 2, name: 'User 2', email: 'user2@example.com' },
  { id: 3, name: 'User 3', email: 'user3@example.com' },
];

// Routes
app.get('/api/products', (_req, res) => {
  const currentSpan = trace.getActiveSpan();

  console.log('\n🔵 Handler: GET /api/products');

  if (currentSpan) {
    const spanContext = currentSpan.spanContext();
    console.log('📊 Span Details:');
    console.log('  - Trace ID:', spanContext.traceId);
    console.log('  - Span ID:', spanContext.spanId);
    console.log('  - Operation:', 'GET /api/products');

    currentSpan.setAttribute('products.count', products.length);
    currentSpan.setAttribute('http.route', '/api/products');
    currentSpan.addEvent('Fetching products', { count: products.length });

    console.log('  - Attributes set: products.count =', products.length);
  } else {
    console.log('⚠️  No active span in handler');
  }

  // Simulate some delay
  setTimeout(() => {
    console.log('✅ Sending products response\n');
    res.json(products);
  }, 200);
});

app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  console.log('\n🔵 Handler: GET /api/products/:id');
  console.log('  - Product ID:', id);

  const currentSpan = trace.getActiveSpan();
  if (currentSpan) {
    const spanContext = currentSpan.spanContext();
    console.log('📊 Span Details:');
    console.log('  - Trace ID:', spanContext.traceId);
    console.log('  - Span ID:', spanContext.spanId);

    currentSpan.setAttribute('product.id', id);
    currentSpan.setAttribute('product.found', !!product);
    currentSpan.setAttribute('http.route', '/api/products/:id');
    currentSpan.addEvent('Product lookup', { id, found: !!product });

    console.log('  - Product found:', !!product);
  }

  if (!product) {
    if (currentSpan) {
      currentSpan.setStatus({ code: SpanStatusCode.ERROR, message: 'Product not found' });
    }
    console.log('❌ Product not found\n');
    return res.status(404).json({ message: 'Product not found' });
  }

  // Simulate some delay
  setTimeout(() => {
    console.log('✅ Sending product response\n');
    res.json(product);
  }, 150);
});

app.get('/api/users', (_req, res) => {
  const currentSpan = trace.getActiveSpan();

  console.log('\n🔵 Handler: GET /api/users');

  if (currentSpan) {
    const spanContext = currentSpan.spanContext();
    console.log('📊 Span Details:');
    console.log('  - Trace ID:', spanContext.traceId);
    console.log('  - Span ID:', spanContext.spanId);

    currentSpan.setAttribute('users.count', users.length);
    currentSpan.setAttribute('http.route', '/api/users');
    currentSpan.addEvent('Fetching users', { count: users.length });

    console.log('  - Attributes set: users.count =', users.length);
  } else {
    console.log('⚠️  No active span in handler');
  }

  // Simulate some delay
  setTimeout(() => {
    console.log('✅ Sending users response\n');
    res.json(users);
  }, 100);
});

app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  console.log('\n🔵 Handler: GET /api/users/:id');
  console.log('  - User ID:', id);

  const currentSpan = trace.getActiveSpan();
  if (currentSpan) {
    const spanContext = currentSpan.spanContext();
    console.log('📊 Span Details:');
    console.log('  - Trace ID:', spanContext.traceId);
    console.log('  - Span ID:', spanContext.spanId);

    currentSpan.setAttribute('user.id', id);
    currentSpan.setAttribute('user.found', !!user);
    currentSpan.setAttribute('http.route', '/api/users/:id');
    currentSpan.addEvent('User lookup', { id, found: !!user });

    console.log('  - User found:', !!user);
  }

  if (!user) {
    if (currentSpan) {
      currentSpan.setStatus({ code: SpanStatusCode.ERROR, message: 'User not found' });
    }
    console.log('❌ User not found\n');
    return res.status(404).json({ message: 'User not found' });
  }

  // Simulate some delay
  setTimeout(() => {
    console.log('✅ Sending user response\n');
    res.json(user);
  }, 120);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
