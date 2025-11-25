# Backend Trace Testing Guide

This guide helps you verify that backend traces are being sent to Coralogix correctly.

## Prerequisites

1. **Coralogix Configuration**: Ensure your `.env` file has the correct values:
   ```bash
   OTEL_EXPORTER_OTLP_ENDPOINT=https://ingress.ap1.coralogix.com/v1/traces
   CORALOGIX_PRIVATE_KEY=your-actual-private-key
   CORALOGIX_APPLICATION_NAME=cx-rum-demo
   CORALOGIX_SUBSYSTEM_NAME=backend
   SERVICE_NAME=cx-rum-backend
   SERVICE_VERSION=1.0.0
   ```

   **Note**: Do NOT include `:443` port in the endpoint URL.

2. **Dependencies Installed**: Run `npm install` in the backend directory

## Starting the Backend

The backend now uses OpenTelemetry instrumentation by default:

```bash
cd backend
npm run dev
```

This will start the server with full OpenTelemetry instrumentation and detailed logging.

## What You'll See in Console

When the backend starts, you should see:

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

## Testing Trace Generation

### 1. Test with Frontend
Start the frontend and navigate to pages that make API calls:
- Products page: `http://localhost:3000/products`
- Users page: `http://localhost:3000/users`

### 2. Test with cURL

**Get all products:**
```bash
curl -H "traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01" \
     http://localhost:3001/api/products
```

**Get single product:**
```bash
curl -H "traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01" \
     http://localhost:3001/api/products/1
```

**Get all users:**
```bash
curl -H "traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01" \
     http://localhost:3001/api/users
```

### 3. Console Output for Each Request

For each request, you'll see detailed logging:

```
=== Incoming Request ===
Method: GET
Path: /api/products
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
baggage: NOT PROVIDED
tracestate: NOT PROVIDED

--- Active Span Context ---
Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736
Span ID: 1234567890abcdef
Trace Flags: 1
Is Sampled: true
---------------------------
========================

🔵 Handler: GET /api/products
📊 Span Details:
  - Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736
  - Span ID: 1234567890abcdef
  - Operation: GET /api/products
  - Attributes set: products.count = 5
✅ Sending products response
```

## Trace Details Logged

### For Each Request:
1. **Incoming Headers**: traceparent, baggage, tracestate
2. **Active Span Context**: Trace ID, Span ID, Trace Flags, Sampling status
3. **Baggage Items**: Any baggage propagated from frontend
4. **Handler Execution**: Route handler with span details
5. **Custom Attributes**: Business-specific attributes added to spans
6. **Events**: Span events for important operations
7. **Status**: Success or error status for each span

## Verifying in Coralogix

1. **Login to Coralogix**: Go to your Coralogix dashboard
2. **Navigate to Traces**: Click on "Explore" → "Traces"
3. **Filter by Service**: Filter by `cx-rum-backend`
4. **Check Trace Details**: You should see:
   - Trace ID matching console output
   - Span hierarchy (HTTP request → Express handler)
   - Custom attributes (products.count, users.count, etc.)
   - Events (Fetching products, Product lookup, etc.)
   - Correlation with frontend traces (same Trace ID)

## Troubleshooting

### No Traces in Coralogix

1. **Check API Key**: Verify `CORALOGIX_PRIVATE_KEY` in `.env`
2. **Check Endpoint**: Verify `OTEL_EXPORTER_OTLP_ENDPOINT` matches your Coralogix region
3. **Check Console**: Look for error messages in backend console
4. **Enable Debug Logging**: The instrumentation already has DiagLogLevel.INFO enabled

### Traces Not Correlated with Frontend

1. **Check traceparent Header**: Frontend must send `traceparent` header
2. **Check Console**: Backend logs show received traceparent
3. **Verify Trace IDs Match**: Compare Trace IDs in frontend and backend logs

### Common Issues

1. **Wrong Coralogix Region** (do NOT include `:443` port):
   - Singapore (AP1): `https://ingress.ap1.coralogix.com/v1/traces`
   - India (AP2): `https://ingress.coralogix.in/v1/traces`
   - US: `https://ingress.coralogix.us/v1/traces`
   - EU: `https://ingress.coralogix.com/v1/traces`

2. **Invalid API Key**: Check that your private key starts with `cxtp_`

3. **Port in Endpoint**: Do NOT include `:443` in the endpoint URL when using HTTP/protobuf exporter

4. **Missing Protocol**: Endpoint must start with `https://`

5. **Network Issues**: Ensure backend can reach Coralogix endpoint (check firewall/proxy)

## Advanced: Custom Spans

The backend includes a tracer and helper functions for creating custom spans. You can add custom instrumentation by using the `tracer` object in your code.

## Next Steps

Once traces are flowing:
1. Test error scenarios (404 responses)
2. Verify trace correlation between frontend and backend
3. Check span attributes and events in Coralogix
4. Set up alerts based on trace data

