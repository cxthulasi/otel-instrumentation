# Quick Start Guide - Full Stack Tracing with Coralogix

This guide will help you get the full-stack application running with complete observability in Coralogix.

## Prerequisites

1. **Coralogix Account**: You need a Coralogix account with:
   - Private Key (starts with `cxtp_`)
   - Application Name
   - Subsystem Name
   - Correct region endpoint

2. **Node.js**: Version 18 or higher

## Step 1: Configure Backend

### 1.1 Update Backend Environment Variables

Edit `backend/.env`:

```bash
# Server Configuration
PORT=3001

# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingress.ap1.coralogix.com/v1/traces
CORALOGIX_PRIVATE_KEY=your-actual-private-key-here

# Coralogix Application Configuration
CORALOGIX_APPLICATION_NAME=cx-rum-demo
CORALOGIX_SUBSYSTEM_NAME=backend

# Service Information
SERVICE_NAME=cx-rum-backend
SERVICE_VERSION=1.0.0
```

**Important**: Replace the endpoint based on your Coralogix region (do NOT include `:443` port):
- **Singapore (AP1)**: `https://ingress.ap1.coralogix.com/v1/traces`
- **US**: `https://ingress.coralogix.us/v1/traces`
- **EU**: `https://ingress.coralogix.com/v1/traces`
- **India**: `https://ingress.coralogix.in/v1/traces`

### 1.2 Install Backend Dependencies

```bash
cd backend
npm install
```

### 1.3 Start Backend

```bash
npm run dev
```

**Expected Output**:
```
=== OpenTelemetry Configuration ===
OTEL Endpoint: https://ingress.ap1.coralogix.com/v1/traces
Service Name: cx-rum-backend
Service Version: 1.0.0
Coralogix Key: ***apzU
===================================
✅ OpenTelemetry instrumentation initialized successfully
📡 Traces will be sent to Coralogix
Server running on port 3001
```

## Step 2: Configure Frontend

### 2.1 Update Frontend Environment Variables

Edit `frontend/.env.local`:

```bash
# Coralogix RUM Configuration
NEXT_PUBLIC_CORALOGIX_APPLICATION_NAME=your-app-name
NEXT_PUBLIC_CORALOGIX_SUBSYSTEM_NAME=frontend
NEXT_PUBLIC_CORALOGIX_API_KEY=your-coralogix-rum-key
NEXT_PUBLIC_CORALOGIX_DOMAIN=ap1.coralogix.com

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Important**: Update the domain based on your Coralogix region:
- **Singapore (AP1)**: `ap1.coralogix.com`
- **US**: `coralogix.us`
- **EU**: `coralogix.com`
- **India**: `coralogix.in`

### 2.2 Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2.3 Start Frontend

```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## Step 3: Test the Application

### 3.1 Navigate to Pages

Open your browser and visit:
- Home: `http://localhost:3000`
- Products: `http://localhost:3000/products`
- Users: `http://localhost:3000/users`

### 3.2 Test Error Simulation

On any page:
1. Click "Show Error Simulator"
2. Try the **purple buttons** for real stack traces:
   - **TypeError**: Real null pointer error
   - **ReferenceError**: Real undefined variable error
   - **Promise Rejection**: Real unhandled promise rejection
   - **Deep Stack**: Real nested function error

### 3.3 Check Backend Console

You should see detailed logs for each request:

```
=== Incoming Request ===
Method: GET
Path: /api/products
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01

--- Active Span Context ---
Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736
Span ID: 1234567890abcdef
Trace Flags: 1
Is Sampled: true
---------------------------

🔵 Handler: GET /api/products
📊 Span Details:
  - Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736
  - Span ID: 1234567890abcdef
  - Attributes set: products.count = 5
✅ Sending products response
```

## Step 4: Verify in Coralogix

### 4.1 Check Frontend RUM Data

1. Login to Coralogix dashboard
2. Navigate to **RUM** → **Sessions**
3. You should see:
   - Active sessions
   - Page views
   - User interactions
   - Errors (if you triggered any)

### 4.2 Check Backend Traces

1. Navigate to **Explore** → **Traces**
2. Filter by service: `cx-rum-backend`
3. You should see:
   - HTTP request spans
   - Custom attributes (products.count, etc.)
   - Span events
   - Response times

### 4.3 Verify Trace Correlation

1. In RUM, click on a session
2. Find a network request to the backend
3. Click on the request to see details
4. Note the **Trace ID**
5. Go to **Traces** and search for that Trace ID
6. You should see both:
   - Frontend span (from RUM)
   - Backend span (from OpenTelemetry)
   - Connected in the same trace!

## Step 5: View Error Stack Traces

### 5.1 Generate Errors

1. Go to any page in the frontend
2. Click "Show Error Simulator"
3. Click **TypeError** button
4. Check browser console for error

### 5.2 View in Coralogix

1. Navigate to **RUM** → **Errors**
2. Find the TypeError you just generated
3. Click on it to see details
4. You should see:
   - **Actual source code location** (e.g., `coralogix.ts:245:12`)
   - **Real stack trace** with file names and line numbers
   - **Error context** (timestamp, URL, user agent, etc.)

## Troubleshooting

### Backend Traces Not Appearing

1. **Check API Key**: Verify `CORALOGIX_PRIVATE_KEY` in `backend/.env`
2. **Check Endpoint**: Verify endpoint matches your Coralogix region
3. **Check Console**: Look for errors in backend console
4. **Test Connection**: Try `curl` to verify backend is running

### Frontend Errors Not Appearing

1. **Check RUM Key**: Verify `NEXT_PUBLIC_CORALOGIX_API_KEY` in `frontend/.env.local`
2. **Check Domain**: Verify domain matches your Coralogix region
3. **Check Browser Console**: Look for Coralogix initialization messages
4. **Check Network Tab**: Verify requests to Coralogix are succeeding

### Traces Not Correlated

1. **Check traceparent Header**: Backend logs should show received traceparent
2. **Compare Trace IDs**: Frontend and backend should have same Trace ID
3. **Check Sampling**: Both frontend and backend should be sampled (trace flag = 01)

## What You Should See

### Console Logs
- ✅ Backend: Detailed trace context for every request
- ✅ Frontend: Coralogix RUM initialization
- ✅ Frontend: Error captures with stack traces

### Coralogix Dashboard
- ✅ RUM: Sessions, page views, user interactions
- ✅ RUM: Errors with real stack traces and source locations
- ✅ Traces: Backend spans with custom attributes
- ✅ Traces: Frontend-backend correlation (same Trace ID)

## Next Steps

1. **Explore RUM Data**: Check user sessions, page performance, errors
2. **Explore Traces**: Check request flows, latencies, errors
3. **Set Up Alerts**: Create alerts based on error rates or latencies
4. **Add Custom Instrumentation**: Add more spans and attributes as needed
5. **Deploy to Production**: Use the deployment guides in the documentation folder

## Additional Resources

- **Frontend Error Testing**: See `frontend/test-errors.md`
- **Backend Trace Testing**: See `backend/test-traces.md`
- **Backend Fixes**: See `BACKEND_FIXES_SUMMARY.md`
- **Full Documentation**: See `documentation/` folder

## Support

If you encounter issues:
1. Check the troubleshooting sections in this guide
2. Review the detailed test guides
3. Check Coralogix documentation for your specific region
4. Verify all environment variables are set correctly

