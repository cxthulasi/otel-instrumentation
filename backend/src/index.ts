// Import instrumentation at the top of the application
import './instrumentation';

import express from 'express';
import cors from 'cors';
import { trace, context, propagation, SpanStatusCode } from '@opentelemetry/api';

const app = express();
const PORT = process.env.PORT || 3001;

// Get the tracer
const tracer = trace.getTracer('cx-rum-backend', '1.0.0');

// console.log('tracer', tracer);

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
// Configure CORS to allow trace context headers (traceparent, baggage, tracestate)
app.use(cors({
  origin: '*',
  credentials: true,
  allowedHeaders: ['Content-Type', 'traceparent', 'baggage', 'tracestate'],
  exposedHeaders: ['traceparent', 'baggage', 'tracestate']
}));
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
  // console.log('currentSpan', currentSpan);
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
  // console.log('currentSpan', currentSpan);

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
  console.log('currentSpan', currentSpan);
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

// ============================================================
// MANUAL INSTRUMENTATION DEMO ENDPOINTS
// These endpoints demonstrate various OpenTelemetry manual instrumentation techniques
// ============================================================

/**
 * Demo 1: Creating Custom Child Spans
 * Shows how to create nested spans for tracking sub-operations
 */
app.get('/api/demo/custom-spans', async (_req, res) => {
  console.log('\n🎯 === DEMO: Custom Child Spans ===');

  // Create a parent span for the entire operation
  const result = await tracer.startActiveSpan('demo.custom-spans-operation', async (parentSpan) => {
    const parentContext = parentSpan.spanContext();
    console.log('📍 Parent Span Created:');
    console.log('   - Trace ID:', parentContext.traceId);
    console.log('   - Span ID:', parentContext.spanId);
    console.log('   - Span Name: demo.custom-spans-operation');

    parentSpan.setAttribute('demo.type', 'custom-spans');
    parentSpan.addEvent('Starting custom spans demo');

    // Child Span 1: Simulate database query
    const dbResult = await tracer.startActiveSpan('demo.database-query', async (dbSpan) => {
      const dbContext = dbSpan.spanContext();
      console.log('\n   📍 Child Span 1 (Database Query):');
      console.log('      - Span ID:', dbContext.spanId);
      console.log('      - Parent Span ID:', parentContext.spanId);

      dbSpan.setAttribute('db.system', 'postgresql');
      dbSpan.setAttribute('db.statement', 'SELECT * FROM users WHERE active = true');
      dbSpan.setAttribute('db.operation', 'SELECT');
      dbSpan.addEvent('Executing database query');

      // Simulate database delay
      await new Promise(resolve => setTimeout(resolve, 100));

      dbSpan.addEvent('Query completed', { rows_returned: 42 });
      dbSpan.setAttribute('db.rows_affected', 42);
      console.log('      - Status: Completed (42 rows)');
      dbSpan.end();

      return { rows: 42 };
    });

    // Child Span 2: Simulate cache operation
    await tracer.startActiveSpan('demo.cache-operation', async (cacheSpan) => {
      const cacheContext = cacheSpan.spanContext();
      console.log('\n   📍 Child Span 2 (Cache Operation):');
      console.log('      - Span ID:', cacheContext.spanId);
      console.log('      - Parent Span ID:', parentContext.spanId);

      cacheSpan.setAttribute('cache.type', 'redis');
      cacheSpan.setAttribute('cache.operation', 'SET');
      cacheSpan.setAttribute('cache.key', 'user:active:list');
      cacheSpan.addEvent('Caching query results');

      // Simulate cache delay
      await new Promise(resolve => setTimeout(resolve, 50));

      cacheSpan.setAttribute('cache.hit', false);
      cacheSpan.addEvent('Cache write completed');
      console.log('      - Status: Cache SET completed');
      cacheSpan.end();
    });

    parentSpan.addEvent('All operations completed');
    parentSpan.end();
    console.log('\n   ✅ Parent span ended');

    return { success: true, dbResult };
  });

  console.log('🎯 === END DEMO: Custom Child Spans ===\n');
  res.json({
    demo: 'custom-spans',
    description: 'Created parent span with 2 child spans (database + cache)',
    result
  });
});

/**
 * Demo 2: Adding Span Events and Attributes
 * Shows how to enrich spans with detailed information
 */
app.get('/api/demo/span-events', async (_req, res) => {
  console.log('\n🎯 === DEMO: Span Events & Attributes ===');

  await tracer.startActiveSpan('demo.span-events-operation', async (span) => {
    const spanContext = span.spanContext();
    console.log('📍 Span Created:');
    console.log('   - Trace ID:', spanContext.traceId);
    console.log('   - Span ID:', spanContext.spanId);

    // Setting various attribute types
    console.log('\n   📝 Setting Attributes:');

    // String attributes
    span.setAttribute('user.id', 'user-123');
    span.setAttribute('user.tier', 'premium');
    console.log('      - user.id: user-123');
    console.log('      - user.tier: premium');

    // Numeric attributes
    span.setAttribute('request.size_bytes', 1024);
    span.setAttribute('response.items_count', 5);
    console.log('      - request.size_bytes: 1024');
    console.log('      - response.items_count: 5');

    // Boolean attributes
    span.setAttribute('feature.new_ui_enabled', true);
    span.setAttribute('cache.hit', false);
    console.log('      - feature.new_ui_enabled: true');
    console.log('      - cache.hit: false');

    // Adding events with timestamps
    console.log('\n   📌 Adding Events:');

    span.addEvent('request.validation.started');
    console.log('      - Event: request.validation.started');
    await new Promise(resolve => setTimeout(resolve, 30));

    span.addEvent('request.validation.completed', {
      'validation.rules_checked': 5,
      'validation.passed': true
    });
    console.log('      - Event: request.validation.completed (5 rules, passed)');

    span.addEvent('business_logic.processing', {
      'processing.step': 'data_transformation',
      'processing.records': 100
    });
    console.log('      - Event: business_logic.processing (100 records)');
    await new Promise(resolve => setTimeout(resolve, 50));

    span.addEvent('response.prepared', {
      'response.format': 'json',
      'response.compressed': false
    });
    console.log('      - Event: response.prepared (json, uncompressed)');

    span.end();
    console.log('\n   ✅ Span ended with all events and attributes');
  });

  console.log('🎯 === END DEMO: Span Events & Attributes ===\n');
  res.json({
    demo: 'span-events',
    description: 'Demonstrated setting attributes (string, number, boolean) and adding events with metadata'
  });
});

/**
 * Demo 3: Error Handling with Spans
 * Shows how to properly record errors and set span status
 */
app.get('/api/demo/error-handling', async (req, res) => {
  const shouldFail = req.query.fail === 'true';
  console.log('\n🎯 === DEMO: Error Handling ===');
  console.log(`   - Failure mode: ${shouldFail ? 'ENABLED' : 'DISABLED'}`);

  try {
    await tracer.startActiveSpan('demo.error-handling-operation', async (span) => {
      const spanContext = span.spanContext();
      console.log('📍 Span Created:');
      console.log('   - Trace ID:', spanContext.traceId);
      console.log('   - Span ID:', spanContext.spanId);

      span.setAttribute('demo.failure_mode', shouldFail);
      span.addEvent('Starting operation');

      if (shouldFail) {
        console.log('\n   ❌ Simulating error...');

        // Record the exception on the span
        const error = new Error('Simulated database connection failure');
        span.recordException(error);
        console.log('      - Exception recorded on span');

        // Set span status to ERROR
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'Database connection failed'
        });
        console.log('      - Span status set to ERROR');

        // Add error-related attributes
        span.setAttribute('error.type', 'DatabaseConnectionError');
        span.setAttribute('error.retry_count', 3);
        span.setAttribute('error.recoverable', true);
        console.log('      - Error attributes added');

        span.addEvent('error.occurred', {
          'error.message': error.message,
          'error.stack': error.stack?.substring(0, 200)
        });

        span.end();
        throw error;
      }

      // Success path
      console.log('\n   ✅ Operation successful');
      span.setStatus({ code: SpanStatusCode.OK });
      span.addEvent('Operation completed successfully');
      span.end();
    });

    res.json({
      demo: 'error-handling',
      status: 'success',
      description: 'Operation completed successfully. Add ?fail=true to simulate an error.'
    });
  } catch (error) {
    console.log('🎯 === END DEMO: Error Handling (with error) ===\n');
    res.status(500).json({
      demo: 'error-handling',
      status: 'error',
      error: (error as Error).message,
      description: 'Error was recorded on span with exception details and ERROR status'
    });
    return;
  }

  console.log('🎯 === END DEMO: Error Handling ===\n');
});

/**
 * Demo 4: Context Propagation
 * Shows how trace context flows through async operations
 */
app.get('/api/demo/context-propagation', async (_req, res) => {
  console.log('\n🎯 === DEMO: Context Propagation ===');

  await tracer.startActiveSpan('demo.context-propagation', async (rootSpan) => {
    const rootContext = rootSpan.spanContext();
    console.log('📍 Root Span:');
    console.log('   - Trace ID:', rootContext.traceId);
    console.log('   - Span ID:', rootContext.spanId);

    // Simulate async service call that maintains context
    const serviceAResult = await simulateServiceCall('ServiceA', 100);
    console.log('   - ServiceA result:', serviceAResult);

    // Another async call - context should still be maintained
    const serviceBResult = await simulateServiceCall('ServiceB', 80);
    console.log('   - ServiceB result:', serviceBResult);

    // Nested async calls
    await tracer.startActiveSpan('demo.orchestrator', async (orchestratorSpan) => {
      console.log('\n   📍 Orchestrator Span:');
      console.log('      - Span ID:', orchestratorSpan.spanContext().spanId);
      console.log('      - Parent (Root) Span ID:', rootContext.spanId);

      orchestratorSpan.setAttribute('orchestrator.services_called', 2);

      // Parallel service calls (context propagates to both)
      const [resultC, resultD] = await Promise.all([
        simulateServiceCall('ServiceC', 60),
        simulateServiceCall('ServiceD', 70)
      ]);

      console.log('      - Parallel results:', { resultC, resultD });
      orchestratorSpan.addEvent('parallel_calls_completed', { resultC, resultD });
      orchestratorSpan.end();
    });

    rootSpan.addEvent('all_services_called');
    rootSpan.end();
  });

  console.log('🎯 === END DEMO: Context Propagation ===\n');
  res.json({
    demo: 'context-propagation',
    description: 'Demonstrated context flowing through sequential and parallel async operations'
  });
});

// Helper function for context propagation demo
async function simulateServiceCall(serviceName: string, delayMs: number): Promise<string> {
  return tracer.startActiveSpan(`demo.service.${serviceName}`, async (span) => {
    span.setAttribute('service.name', serviceName);
    span.setAttribute('service.delay_ms', delayMs);

    const currentSpan = trace.getActiveSpan();
    console.log(`\n   📍 ${serviceName} Span:`);
    console.log(`      - Span ID: ${span.spanContext().spanId}`);
    console.log(`      - Active span matches: ${currentSpan === span}`);

    await new Promise(resolve => setTimeout(resolve, delayMs));

    span.addEvent(`${serviceName}.completed`);
    span.end();

    return `${serviceName}:OK`;
  });
}

/**
 * Demo 5: Baggage Usage
 * Shows how to read and use baggage for cross-cutting concerns
 */
app.get('/api/demo/baggage', (_req, res) => {
  console.log('\n🎯 === DEMO: Baggage Usage ===');

  tracer.startActiveSpan('demo.baggage-operation', (span) => {
    const spanContext = span.spanContext();
    console.log('📍 Span Created:');
    console.log('   - Trace ID:', spanContext.traceId);
    console.log('   - Span ID:', spanContext.spanId);

    // Get current context and extract baggage
    const currentContext = context.active();
    const baggage = propagation.getBaggage(currentContext);

    console.log('\n   🧳 Baggage Contents:');
    const baggageItems: Record<string, string> = {};

    if (baggage) {
      baggage.getAllEntries().forEach(([key, entry]) => {
        baggageItems[key] = entry.value;
        console.log(`      - ${key}: ${entry.value}`);

        // Add baggage items as span attributes for correlation
        span.setAttribute(`baggage.${key}`, entry.value);
      });

      span.addEvent('baggage.extracted', { items_count: Object.keys(baggageItems).length });
    } else {
      console.log('      - No baggage found in context');
      span.addEvent('baggage.not_found');
    }

    // Demonstrate using baggage for business logic
    if (baggageItems['userId']) {
      console.log(`\n   👤 User identified from baggage: ${baggageItems['userId']}`);
      span.setAttribute('user.identified', true);
      span.setAttribute('user.source', 'baggage');
    }

    if (baggageItems['environment']) {
      console.log(`   🌍 Environment from baggage: ${baggageItems['environment']}`);
    }

    span.end();
    console.log('\n   ✅ Baggage demo completed');

    res.json({
      demo: 'baggage',
      description: 'Extracted and used baggage items from trace context',
      baggage: baggageItems,
      tip: 'Send baggage header like: baggage: userId=123,environment=prod'
    });
  });

  console.log('🎯 === END DEMO: Baggage Usage ===\n');
});

/**
 * Demo Index - Lists all available demos
 */
app.get('/api/demo', (_req, res) => {
  console.log('\n📚 Manual Instrumentation Demo Index requested\n');

  res.json({
    title: 'OpenTelemetry Manual Instrumentation Demos',
    demos: [
      {
        endpoint: '/api/demo/custom-spans',
        description: 'Creating nested parent-child spans for sub-operations',
        concepts: ['startActiveSpan', 'nested spans', 'span hierarchy']
      },
      {
        endpoint: '/api/demo/span-events',
        description: 'Adding events and attributes to spans',
        concepts: ['setAttribute', 'addEvent', 'attribute types']
      },
      {
        endpoint: '/api/demo/error-handling',
        description: 'Proper error recording and span status',
        query_params: { fail: 'true to simulate error' },
        concepts: ['recordException', 'setStatus', 'SpanStatusCode']
      },
      {
        endpoint: '/api/demo/context-propagation',
        description: 'Trace context flow through async operations',
        concepts: ['context propagation', 'async/await', 'parallel operations']
      },
      {
        endpoint: '/api/demo/baggage',
        description: 'Reading and using W3C Baggage',
        concepts: ['getBaggage', 'cross-cutting concerns', 'correlation']
      }
    ]
  });
});

// ============================================================
// END OF MANUAL INSTRUMENTATION DEMOS
// ============================================================

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`\n📚 Manual Instrumentation Demos available at:`);
  console.log(`   - GET http://localhost:${PORT}/api/demo (index)`);
  console.log(`   - GET http://localhost:${PORT}/api/demo/custom-spans`);
  console.log(`   - GET http://localhost:${PORT}/api/demo/span-events`);
  console.log(`   - GET http://localhost:${PORT}/api/demo/error-handling`);
  console.log(`   - GET http://localhost:${PORT}/api/demo/context-propagation`);
  console.log(`   - GET http://localhost:${PORT}/api/demo/baggage\n`);
});
