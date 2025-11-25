# Backend Tracing Fixes Summary

## Issues Fixed

### 1. **Backend Not Using OpenTelemetry Instrumentation**
**Problem**: The `npm run dev` script was using `index-simple.ts` instead of `index.ts`, which meant OpenTelemetry instrumentation was not being loaded.

**Fix**: Updated `package.json` to use `index.ts` by default:
```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "dev:simple": "ts-node-dev --respawn --transpile-only src/index-simple.ts"
}
```

### 2. **No Logging for Traces, Spans, and Context**
**Problem**: Backend was not logging trace context, span details, baggage, or other telemetry information.

**Fix**: Added comprehensive logging throughout the backend:

#### Enhanced Instrumentation (`src/instrumentation.ts`)
- Added OpenTelemetry diagnostic logging with `DiagLogLevel.INFO`
- Added startup configuration logging showing:
  - OTEL endpoint
  - Service name and version
  - Coralogix API key (masked)
- Added success/failure messages for initialization

#### Enhanced Middleware (`src/index.ts`)
Added middleware that logs for every request:
- HTTP method and path
- `traceparent` header (W3C Trace Context)
- `baggage` header
- `tracestate` header
- Active span context (Trace ID, Span ID, Trace Flags)
- Sampling status
- Baggage items (if present)

#### Enhanced Route Handlers
All route handlers now log:
- Route being handled
- Span details (Trace ID, Span ID)
- Custom attributes being set
- Operation results
- Response status

### 3. **Limited Span Attributes and Events**
**Problem**: Spans had minimal attributes and no events.

**Fix**: Added rich telemetry to all routes:
- Custom attributes: `products.count`, `users.count`, `product.id`, `user.id`, `product.found`, `user.found`
- HTTP route attributes: `http.route`
- Span events: "Fetching products", "Product lookup", "User lookup"
- Error status codes for 404 responses

## Files Modified

1. **`backend/package.json`**
   - Changed default `dev` script to use `index.ts` with OpenTelemetry

2. **`backend/src/instrumentation.ts`**
   - Added diagnostic logging
   - Added configuration output
   - Added initialization status messages

3. **`backend/src/index.ts`**
   - Added imports: `context`, `propagation`, `SpanStatusCode`
   - Added tracer instance
   - Added `logSpanDetails` helper function
   - Enhanced middleware with comprehensive logging
   - Enhanced all route handlers with span logging
   - Added error status codes for 404 responses

## Files Created

1. **`backend/test-traces.md`**
   - Comprehensive guide for testing backend traces
   - Instructions for verifying Coralogix integration
   - Troubleshooting tips
   - Example console output

## How to Test

### 1. Start the Backend
```bash
cd backend
npm run dev
```

### 2. Expected Console Output
```
=== OpenTelemetry Configuration ===
OTEL Endpoint: https://ingress.ap1.coralogix.com:443/v1/traces
Service Name: cx-rum-backend
Service Version: 1.0.0
Coralogix Key: ***pzU
===================================
✅ OpenTelemetry instrumentation initialized successfully
📡 Traces will be sent to Coralogix
Server running on port 3001
```

### 3. Make a Request
From frontend or using cURL:
```bash
curl http://localhost:3001/api/products
```

### 4. Check Console for Detailed Logs
You should see:
- Incoming request details
- Trace context (traceparent, baggage)
- Active span information
- Handler execution logs
- Response status

### 5. Verify in Coralogix
- Login to Coralogix dashboard
- Navigate to Traces
- Filter by service: `cx-rum-backend`
- Verify traces are appearing with:
  - Correct Trace IDs
  - Custom attributes
  - Span events
  - Correlation with frontend traces

## What Gets Logged

### For Every Request:
1. **Request Headers**: traceparent, baggage, tracestate
2. **Span Context**: Trace ID, Span ID, Trace Flags, Sampling status
3. **Baggage**: All baggage items propagated from frontend
4. **Handler Details**: Route, operation, span IDs
5. **Custom Attributes**: Business-specific data
6. **Events**: Important operations within spans
7. **Status**: Success or error codes
8. **Response**: Confirmation of response sent

### Example Console Output:
```
=== Incoming Request ===
Method: GET
Path: /api/products
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
baggage: userId=123,sessionId=abc
tracestate: NOT PROVIDED

--- Active Span Context ---
Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736
Span ID: 1234567890abcdef
Trace Flags: 1
Is Sampled: true
---------------------------

--- Baggage Items ---
userId: 123
sessionId: abc
---------------------
========================

🔵 Handler: GET /api/products
📊 Span Details:
  - Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736
  - Span ID: 1234567890abcdef
  - Operation: GET /api/products
  - Attributes set: products.count = 5
✅ Sending products response
```

## Benefits

1. **Full Visibility**: See exactly what's happening with traces and spans
2. **Easy Debugging**: Console logs show trace correlation in real-time
3. **Coralogix Integration**: Traces are sent to Coralogix with rich context
4. **Frontend-Backend Correlation**: Trace IDs match between frontend and backend
5. **Custom Attributes**: Business-specific data attached to spans
6. **Error Tracking**: 404s and errors are properly marked in spans

## Next Steps

1. Start the backend with `npm run dev`
2. Start the frontend with `npm run dev`
3. Navigate to products or users pages
4. Check backend console for detailed trace logs
5. Verify traces in Coralogix dashboard
6. Confirm frontend and backend traces are correlated (same Trace ID)

