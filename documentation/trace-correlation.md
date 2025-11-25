# Trace Correlation

This document explains how trace correlation works between the frontend and backend in our application, enabling end-to-end visibility of user requests.

## Overview

Trace correlation is the process of connecting traces across service boundaries, allowing you to track a request as it flows through your system. In our application, we use the W3C Trace Context standard to propagate trace context from the frontend to the backend.

```
┌─────────────────┐                ┌─────────────────┐
│                 │                │                 │
│    Frontend     │───────────────►│     Backend     │
│    (Next.js)    │  traceparent   │    (Node.js)    │
│                 │                │                 │
└────────┬────────┘                └────────┬────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
┌─────────────────┐                ┌─────────────────┐
│                 │                │                 │
│   Coralogix    │                │   Coralogix    │
│   RUM Service   │                │  Tracing Service│
│                 │                │                 │
└─────────────────┘                └─────────────────┘
         │                                  │
         │                                  │
         └──────────────────────────────────┘
                  Correlated Traces
```

## W3C Trace Context

The W3C Trace Context standard defines a format for propagating trace context across service boundaries. It consists of two headers:

1. `traceparent`: Contains the trace ID, span ID, and trace flags
2. `tracestate`: Contains vendor-specific trace information

In our application, we primarily use the `traceparent` header, which has the following format:

```
traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
             │  │                               │                │
             │  │                               │                └─ Trace Flags
             │  │                               └──────────────────── Parent Span ID
             │  └───────────────────────────────────────────────────── Trace ID
             └────────────────────────────────────────────────────────── Version
```

## Frontend Implementation

### Coralogix RUM SDK Configuration

The Coralogix RUM SDK is configured to automatically add the `traceparent` header to outgoing requests:

```typescript
CoralogixRum.init({
  // ...
  traceParentInHeader: {
    enabled: true,
    options: {
      propagateTraceHeaderCorsUrls: [new RegExp('.*')],
      allowedTracingUrls: [new RegExp('.*')]
    }
  }
});
```

### Manual Trace Context Propagation

For cases where automatic propagation doesn't work, we manually add the `traceparent` header to API requests:

```typescript
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
```

## Backend Implementation

### OpenTelemetry Configuration

The OpenTelemetry SDK is configured to automatically extract the `traceparent` header from incoming requests and continue the trace:

```typescript
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
```

### CORS Configuration

To ensure the `traceparent` header is properly received by the backend, we configure CORS to expose the header:

```typescript
app.use(cors({
  origin: '*',
  credentials: true,
  exposedHeaders: ['traceparent']
}));
```

## Visualization in Coralogix

Both the frontend and backend send telemetry data to Coralogix, where it can be visualized and analyzed. The trace ID in the `traceparent` header is used to correlate traces between the frontend and backend.

### Trace Flow Example

1. User clicks on a product in the frontend
2. Coralogix RUM SDK captures the click event and creates a span
3. Frontend makes an API request to the backend with the `traceparent` header
4. Backend extracts the trace context and continues the trace
5. Backend fetches data from external APIs and returns it to the frontend
6. Both frontend and backend send telemetry data to Coralogix
7. Coralogix correlates the traces using the trace ID

## Troubleshooting

If trace correlation is not working as expected, check the following:

1. Verify that the `traceparent` header is being added to API requests:
   ```javascript
   // Add a console log to check the headers
   console.log('Request headers:', config.headers);
   ```

2. Verify that the backend is receiving the `traceparent` header:
   ```javascript
   // Add a middleware to log the headers
   app.use((req, res, next) => {
     console.log('Request headers:', req.headers);
     next();
   });
   ```

3. Check that CORS is properly configured to expose the `traceparent` header.

4. Verify that both the frontend and backend are sending telemetry data to the same Coralogix account.

## Next Steps

- [Frontend Documentation](./frontend.md)
- [Backend Documentation](./backend.md)
- [Deployment Guide](./deployment.md)
