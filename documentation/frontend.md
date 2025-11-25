# Frontend Documentation

This document provides detailed information about the frontend application, focusing on the integration with Coralogix RUM SDK.

## Technology Stack

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **UI Library**: Chakra UI
- **Observability**: Coralogix Browser RUM SDK

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── about/       # About page
│   │   ├── docs/        # Documentation pages
│   │   ├── products/    # Products pages
│   │   ├── users/       # Users pages
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Home page
│   ├── components/      # React components
│   │   ├── ClientLayout.tsx
│   │   ├── CoralogixInitializer.tsx
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   ├── lib/             # Utility functions
│   │   ├── api.ts       # API client
│   │   ├── chakra.tsx   # Chakra UI provider
│   │   └── coralogix.ts # Coralogix RUM initialization
│   └── types/           # TypeScript type definitions
│       └── global.d.ts  # Global type declarations
├── .env                 # Environment variables
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## Coralogix RUM SDK Integration

### Installation

```bash
npm install @coralogix/browser
```

### Initialization

The Coralogix RUM SDK is initialized in `src/lib/coralogix.ts`:

```typescript
import { CoralogixRum, CoralogixLogSeverity } from '@coralogix/browser';

export function initCoralogix() {
  if (typeof window === 'undefined') {
    return;
  }

  CoralogixRum.init({
    public_key: process.env.NEXT_PUBLIC_CORALOGIX_KEY || 'your-key',
    application: process.env.NEXT_PUBLIC_CORALOGIX_APPLICATION_NAME || 'app-name',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    coralogixDomain: process.env.NEXT_PUBLIC_CORALOGIX_DOMAIN || 'AP1',
    traceParentInHeader: {
      enabled: true,
      options: {
        propagateTraceHeaderCorsUrls: [new RegExp('.*')],
        allowedTracingUrls: [new RegExp('.*')]
      }
    }
  });

  console.log('Coralogix RUM initialized');
}
```

### Integration with Next.js

The SDK is initialized in two places to ensure it works in both client and server components:

1. **Client Component Initialization** (`src/components/CoralogixInitializer.tsx`):

```typescript
export function CoralogixInitializer() {
  useEffect(() => {
    // Initialize Coralogix RUM on the client side
    initCoralogix();
  }, []);

  return null; // This component doesn't render anything
}
```

2. **Script Tag Initialization** (`src/app/layout.tsx`):

```typescript
const RumScript = () => {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if (typeof window !== 'undefined') {
                import('@/lib/coralogix').then(({ initCoralogix }) => {
                  initCoralogix();
                }).catch(error => {
                  console.error('Error initializing Coralogix RUM:', error);
                });
              }
            })();
          `,
        }}
      />
      <script src="https://cdn.rum-ingress-coralogix.com/coralogix/browser/latest/coralogix-browser-sdk.js" async></script>
    </>
  );
};
```

## Coralogix RUM SDK Methods

### Custom Events

```typescript
// Track custom events
import { CoralogixRum, CoralogixLogSeverity } from '@coralogix/browser';

// Info level log
CoralogixRum.log(CoralogixLogSeverity.Info, 'User clicked on product');

// Error level log
CoralogixRum.log(CoralogixLogSeverity.Error, 'Failed to load product', { productId: '123' });

// Warning level log with custom data
CoralogixRum.warning('Warning message', { data: 'value' });

// Error level log with custom data
CoralogixRum.error('Error message', { data: 'value' });
```

### Error Tracking

```typescript
// Manually capture errors
try {
  // Some code that might throw an error
} catch (error) {
  CoralogixRum.captureError(error);
  
  // With custom data
  CoralogixRum.captureError(error, { productId: '123' });
  
  // With custom data and labels
  CoralogixRum.captureError(error, { productId: '123' }, { feature: 'checkout' });
}
```

### User Context

```typescript
// Set user context
CoralogixRum.setUserContext({
  user_id: '123',
  user_name: 'John Doe',
  user_email: 'john@example.com',
  user_metadata: {
    role: 'admin',
  },
});
```

### Custom Labels

```typescript
// Set custom labels
CoralogixRum.setLabels({
  feature: 'checkout',
  experiment: 'A',
});
```

### Trace Context

```typescript
// Get trace context for manual propagation
const traceContext = CoralogixRum.getTraceContext();
if (traceContext && traceContext.traceparent) {
  // Use traceparent in API requests
  headers['traceparent'] = traceContext.traceparent;
}
```

## Trace Context Propagation

The trace context is automatically propagated to the backend using the `traceparent` header in API requests. This is configured in `src/lib/api.ts`:

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

## Environment Variables

The following environment variables are used to configure the Coralogix RUM SDK:

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Coralogix RUM Configuration
NEXT_PUBLIC_CORALOGIX_KEY=your-coralogix-public-key
NEXT_PUBLIC_CORALOGIX_APPLICATION_NAME=cx-rum-fullstack-ts
NEXT_PUBLIC_CORALOGIX_DOMAIN=AP1
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Next Steps

- [Backend Documentation](./backend.md)
- [Trace Correlation](./trace-correlation.md)
- [Deployment Guide](./deployment.md)
