# Coralogix RUM and OpenTelemetry Demo - Documentation

This document provides a comprehensive guide to setting up, running, and understanding the Coralogix RUM and OpenTelemetry demo application.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [Distributed Tracing](#distributed-tracing)
9. [Troubleshooting](#troubleshooting)
10. [Additional Resources](#additional-resources)

## Project Overview

This project demonstrates how to implement distributed tracing across a full-stack application using:

- **Frontend**: Next.js with Coralogix RUM SDK
- **Backend**: Node.js with OpenTelemetry instrumentation

The application allows users to browse products and users, with trace context propagation from the frontend to the backend, enabling end-to-end visibility of user requests.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- A Coralogix account (for sending telemetry data)

## Installation

1. **Clone the repository**:

```bash
git clone https://github.com/yourusername/cx-rum-frontend-ts.git
cd cx-rum-frontend-ts
```

2. **Install dependencies**:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

## Configuration

### Environment Variables

1. **Create frontend environment file**:

Create a `.env` file in the `frontend` directory with the following content:

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Coralogix RUM Configuration
NEXT_PUBLIC_CORALOGIX_KEY=your-coralogix-public-key
NEXT_PUBLIC_CORALOGIX_APPLICATION_NAME=cx-rum-fullstack-ts
NEXT_PUBLIC_CORALOGIX_DOMAIN=AP1
NEXT_PUBLIC_APP_VERSION=1.0.0
```

2. **Create backend environment file**:

Create a `.env` file in the `backend` directory with the following content:

```
# Server Configuration
PORT=3001

# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingress.coralogix.in:443/v1/traces
CORALOGIX_PRIVATE_KEY=your-coralogix-private-key

# Service Information
SERVICE_NAME=cx-rum-backend
SERVICE_VERSION=1.0.0
```

Replace `your-coralogix-public-key` and `your-coralogix-private-key` with your actual Coralogix keys.

## Running the Application

### Development Mode

1. **Start the backend server**:

```bash
# From the root directory
cd backend
npm run dev
```

2. **Start the frontend server**:

```bash
# From the root directory
cd frontend
npm run dev
```

3. **Access the application**:

Open your browser and navigate to `http://localhost:3000`

### Production Mode

1. **Build the applications**:

```bash
# Build the frontend
cd frontend
npm run build

# Build the backend
cd ../backend
npm run build
```

2. **Start the applications**:

```bash
# Start the backend
cd backend
npm run start

# Start the frontend
cd ../frontend
npm run start
```

## Frontend Architecture

### Project Structure

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

### Key Components

#### Coralogix RUM Integration

The frontend is instrumented with Coralogix RUM SDK in `src/lib/coralogix.ts`:

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
    coralogixDomain: 'AP1',
    traceParentInHeader: {
      enabled: true,
      options: {
        propagateTraceHeaderCorsUrls: [new RegExp('http://localhost:3001.*')],
        allowedTracingUrls: [new RegExp('.*')]
      }
    }
  });
}
```

#### API Client

The API client in `src/lib/api.ts` handles communication with the backend and ensures trace context propagation:

```typescript
import axios from 'axios';

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
      }
    } catch (error) {
      console.error('Error getting trace context:', error);
    }
  }
  
  return config;
});
```

## Backend Architecture

### Project Structure

```
backend/
├── src/
│   ├── index-simple.ts       # Main application entry point (without OpenTelemetry)
│   ├── index.ts              # Main application entry point (with OpenTelemetry)
│   └── instrumentation.ts    # OpenTelemetry instrumentation
├── dist/                     # Compiled JavaScript files
├── .env                      # Environment variables
├── package.json              # Project dependencies
└── tsconfig.json             # TypeScript configuration
```

### Key Components

#### OpenTelemetry Instrumentation

The backend is instrumented with OpenTelemetry in `src/instrumentation.ts`:

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
```

#### API Endpoints

The backend provides the following API endpoints:

- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get a product by ID
- `GET /api/users`: Get all users
- `GET /api/users/:id`: Get a user by ID

#### CORS Configuration

The backend is configured to allow cross-origin requests from the frontend:

```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['traceparent']
}));
```

## Distributed Tracing

### Trace Context Propagation

1. **Frontend**: The Coralogix RUM SDK automatically adds the `traceparent` header to outgoing requests.

2. **Backend**: OpenTelemetry automatically extracts the `traceparent` header from incoming requests and continues the trace.

3. **Visualization**: Both frontend and backend telemetry data is sent to Coralogix, where it can be visualized and analyzed.

### Trace Context Format

The `traceparent` header follows the W3C Trace Context specification:

```
traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
             │  │                               │                │
             │  │                               │                ┕ Trace flags
             │  │                               ┕ Parent span ID
             │  ┕ Trace ID
             ┕ Version
```

## Troubleshooting

### Common Issues

1. **Traceparent header is undefined**:
   - Ensure CORS is properly configured on the backend
   - Check that `exposedHeaders` includes 'traceparent'
   - Verify that Coralogix RUM is properly initialized

2. **OpenTelemetry initialization error**:
   - Check that the OTEL_EXPORTER_OTLP_ENDPOINT is correct
   - Verify that the CORALOGIX_PRIVATE_KEY is valid

3. **Frontend-backend connection issues**:
   - Ensure the backend is running on the correct port
   - Check that NEXT_PUBLIC_API_URL is set correctly

## Additional Resources

- [Coralogix RUM Documentation](https://coralogix.com/docs/real-user-monitoring/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [W3C Trace Context Specification](https://www.w3.org/TR/trace-context/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
