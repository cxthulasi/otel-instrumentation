# Architecture Overview

This document provides a high-level overview of the architecture of our full-stack application with Coralogix RUM SDK on the frontend and OpenTelemetry instrumentation on the backend.

## System Architecture

The application follows a modern client-server architecture with the following components:

```
┌─────────────────┐                ┌─────────────────┐                ┌─────────────────┐
│                 │                │                 │                │                 │
│    Frontend     │◄──────────────►│     Backend     │◄──────────────►│  External APIs  │
│    (Next.js)    │    HTTP/REST   │    (Node.js)    │    HTTP/REST   │(JSONPlaceholder)│
│                 │                │                 │                │                 │
└────────┬────────┘                └────────┬────────┘                └─────────────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
┌─────────────────┐                ┌─────────────────┐
│                 │                │                 │
│   Coralogix    │                │   Coralogix    │
│   RUM Service   │                │  Tracing Service│
│                 │                │                 │
└─────────────────┘                └─────────────────┘
```

### Frontend (Next.js)

- Built with Next.js, TypeScript, and Chakra UI
- Instrumented with Coralogix Browser RUM SDK
- Implements trace context propagation to the backend
- Deployed as a static website on AWS S3

### Backend (Node.js)

- Built with Node.js, Express, and TypeScript
- Auto-instrumented with OpenTelemetry
- Extracts trace context from frontend requests
- Deployed as a serverless function on AWS Lambda with API Gateway

### Observability

- Frontend telemetry data sent to Coralogix RUM service
- Backend telemetry data sent to Coralogix Tracing service
- End-to-end trace correlation between frontend and backend

## Project Structure

```
project-root/
├── frontend/              # Next.js frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utility functions
│   │   └── types/         # TypeScript type definitions
│   ├── .env               # Environment variables
│   └── package.json       # Frontend dependencies
├── backend/               # Node.js backend application
│   ├── src/
│   │   ├── index.ts       # Main application entry point
│   │   └── instrumentation.ts # OpenTelemetry instrumentation
│   ├── .env               # Environment variables
│   └── package.json       # Backend dependencies
└── infrastructure/        # Deployment configuration
    ├── backend/           # Backend deployment code
    │   └── serverless.yml # Serverless Framework configuration
    └── frontend/          # Frontend deployment code
        └── serverless.yml # S3 static website configuration
```

## Data Flow

1. User interacts with the frontend application
2. Coralogix RUM SDK captures user interactions, performance metrics, and errors
3. Frontend makes API requests to the backend with trace context in headers
4. Backend extracts trace context and continues the trace
5. Backend fetches data from external APIs (JSONPlaceholder)
6. Backend returns data to the frontend
7. Both frontend and backend send telemetry data to Coralogix
8. Coralogix correlates frontend and backend traces for end-to-end visibility

## Trace Correlation

Trace correlation is achieved through the W3C Trace Context standard:

1. Coralogix RUM SDK generates a trace ID and span ID for each user session
2. The trace context is propagated in the `traceparent` header in API requests
3. Backend extracts the trace context and continues the trace
4. Both frontend and backend send telemetry data with the same trace ID to Coralogix

For more details on trace correlation, see the [Trace Correlation](./trace-correlation.md) document.

## Next Steps

- [Frontend Documentation](./frontend.md)
- [Backend Documentation](./backend.md)
- [Trace Correlation](./trace-correlation.md)
- [Deployment Guide](./deployment.md)
