# Backend Documentation

This document provides detailed information about the backend application, focusing on the integration with OpenTelemetry for distributed tracing.

## Technology Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **Observability**: OpenTelemetry
- **Deployment**: AWS Lambda with API Gateway

## Project Structure

```
backend/
├── src/
│   ├── index.ts           # Main application entry point
│   ├── instrumentation.ts # OpenTelemetry instrumentation
│   └── index-simple.ts    # Simplified version without OpenTelemetry
├── .env                   # Environment variables
├── package.json           # Project dependencies
└── tsconfig.json          # TypeScript configuration
```

## OpenTelemetry Integration

### Installation

```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http @opentelemetry/resources @opentelemetry/semantic-conventions
```

### Instrumentation Setup

The OpenTelemetry instrumentation is set up in `src/instrumentation.ts`:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Configure the SDK to export telemetry data to Coralogix
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://ingress.coralogix.in:443/v1/traces',
  headers: {
    'Authorization': `Bearer ${process.env.CORALOGIX_PRIVATE_KEY || 'your-coralogix-private-key'}`,
  },
});

// Initialize the SDK
export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME || 'cx-rum-backend',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.SERVICE_VERSION || '1.0.0',
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingPaths: ['/health', '/metrics'],
      },
      '@opentelemetry/instrumentation-express': { enabled: true },
    }),
  ],
});

// Start the SDK
try {
  otelSDK.start();
  console.log('OpenTelemetry instrumentation initialized');
} catch (error) {
  console.error('Error initializing OpenTelemetry instrumentation:', error);
}

// Gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  try {
    otelSDK.shutdown();
    console.log('OpenTelemetry SDK shut down successfully');
  } catch (error) {
    console.error('Error shutting down OpenTelemetry SDK:', error);
  } finally {
    process.exit(0);
  }
});
```

### Integration with Express.js

The OpenTelemetry instrumentation is imported at the top of the main application file (`src/index.ts`):

```typescript
// Import instrumentation at the top of the application
import './instrumentation';

import express from 'express';
import cors from 'cors';
import { trace } from '@opentelemetry/api';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to log trace context
app.use((req, res, next) => {
  const traceParent = req.headers['traceparent'];
  console.log(`Received request with traceparent: ${traceParent}`);
  next();
});

// Routes with custom attributes
app.get('/api/products', (req, res) => {
  const currentSpan = trace.getActiveSpan();
  if (currentSpan) {
    currentSpan.setAttribute('products.count', products.length);
  }
  
  // Simulate some delay
  setTimeout(() => {
    res.json(products);
  }, 200);
});
```

## Trace Context Extraction

The backend extracts the trace context from the `traceparent` header in incoming requests. This is done automatically by the OpenTelemetry HTTP instrumentation.

For debugging purposes, a middleware is added to log the trace context:

```typescript
// Middleware to log trace context
app.use((req, res, next) => {
  const traceParent = req.headers['traceparent'];
  console.log(`Received request with traceparent: ${traceParent}`);
  next();
});
```

## Custom Span Attributes

Custom attributes can be added to spans to provide more context:

```typescript
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  const currentSpan = trace.getActiveSpan();
  if (currentSpan) {
    currentSpan.setAttribute('product.id', id);
    currentSpan.setAttribute('product.found', !!product);
  }
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});
```

## External API Integration

The backend fetches data from the JSONPlaceholder API:

```typescript
// Function to fetch products from JSONPlaceholder and transform them
async function fetchProducts() {
  if (productsCache.length > 0) {
    return productsCache;
  }
  
  try {
    // Fetch posts from JSONPlaceholder and transform them into products
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=10');
    
    // Transform posts into products with prices and descriptions
    productsCache = response.data.map((post: any) => ({
      id: post.id,
      name: `Product ${post.id}: ${post.title.substring(0, 20)}...`,
      price: Number((post.id * 49.99).toFixed(2)),
      description: post.body
    }));
    
    return productsCache;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}
```

## AWS Lambda Integration

For deployment to AWS Lambda, a wrapper is created in `infrastructure/backend/src/lambda.ts`:

```typescript
import serverlessExpress from '@vendia/serverless-express';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { app } from './app';

// Initialize OpenTelemetry
import './instrumentation';

// Create serverless-express handler
let serverlessExpressInstance: any;

async function setup(event: APIGatewayProxyEvent, context: Context) {
  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context);
}

export const handler = (event: APIGatewayProxyEvent, context: Context) => {
  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context);
  }
  return setup(event, context);
};
```

## Environment Variables

The following environment variables are used to configure the OpenTelemetry instrumentation:

```
# Server Configuration
PORT=3001

# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingress.coralogix.in:443/v1/traces
CORALOGIX_PRIVATE_KEY=your-coralogix-private-key

# Service Information
SERVICE_NAME=cx-rum-backend
SERVICE_VERSION=1.0.0

# JSONPlaceholder API (for reference)
JSONPLACEHOLDER_API_URL=https://jsonplaceholder.typicode.com
```

## Next Steps

- [Frontend Documentation](./frontend.md)
- [Trace Correlation](./trace-correlation.md)
- [Deployment Guide](./deployment.md)
