# Coralogix RUM and OpenTelemetry Demo

This is a full-stack application demonstrating the integration of Coralogix Browser RUM SDK on the frontend and OpenTelemetry instrumentation on the backend. It shows how to implement distributed tracing across the full stack.

## Features

- Next.js frontend with TypeScript and Chakra UI
- Node.js backend with Express and TypeScript
- Frontend instrumented with Coralogix Browser RUM SDK
- Backend auto-instrumented with OpenTelemetry
- Trace context propagation from frontend to backend
- Mock API endpoints for demonstration

## Project Structure

```
cx-rum-frontend-ts/
├── frontend/           # Next.js frontend application
│   ├── src/
│   │   ├── app/        # Next.js app directory
│   │   ├── components/ # React components
│   │   └── lib/        # Utility functions and libraries
│   └── ...
├── backend/            # Node.js backend application
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── ...
│   └── ...
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/cx-rum-frontend-ts.git
cd cx-rum-frontend-ts
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following variables:

```
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CORALOGIX_KEY=your-coralogix-private-key

# Backend
CORALOGIX_PRIVATE_KEY=your-coralogix-private-key
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingress.coralogix.com:443/v1/traces
```

### Running the Application

1. Start the development servers:

```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend
```

2. Open your browser and navigate to `http://localhost:3000`

## Observability Features

### Frontend (Coralogix Browser RUM SDK)

- Automatic tracking of page views
- Automatic tracking of user interactions
- Automatic tracking of API calls
- Automatic tracking of errors
- Custom event tracking
- Trace context propagation to backend

### Backend (OpenTelemetry)

- Auto-instrumentation of HTTP requests
- Auto-instrumentation of Express routes
- Trace context extraction from frontend requests
- Custom span attributes
- Trace export to Coralogix

## License

MIT
# cx-rum-frontend-ts
