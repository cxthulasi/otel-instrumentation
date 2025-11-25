# Troubleshooting 403 Forbidden Error

## Problem

You're getting a `403 Forbidden` error when trying to send traces to Coralogix:

```json
{
  "stack": "OTLPExporterError: Forbidden\n    at IncomingMessage.<anonymous> ...",
  "message": "Forbidden",
  "name": "OTLPExporterError",
  "code": "403"
}
```

## Root Causes

### 1. **Environment Variables Not Loaded (Most Common)**

If you see `Coralogix Key: NOT SET` in the console, it means the `.env` file is not being loaded.

**Symptom:**
```
=== OpenTelemetry Configuration ===
OTEL Endpoint: https://ingress.ap1.coralogix.com/v1/traces
Service Name: cx-rum-backend
Service Version: 1.0.0
Coralogix Key: NOT SET    <-- This is the problem!
===================================
```

**Root Cause:** The `dotenv` package is not installed or not being loaded.

**Solution:**
1. Install dotenv: `npm install dotenv`
2. Load it at the very beginning of `instrumentation.ts`:
   ```typescript
   // Load environment variables FIRST before anything else
   import dotenv from 'dotenv';
   dotenv.config();
   ```

### 2. **Missing `https://` Protocol in Endpoint**

**Incorrect:**
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=ingress.ap1.coralogix.com:443/v1/traces
```

**Correct:**
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingress.ap1.coralogix.com/v1/traces
```

### 3. **Port Number in HTTP Endpoint**

According to Coralogix documentation, when using HTTP/protobuf exporter, **do not include the `:443` port**.

**Incorrect:**
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingress.ap1.coralogix.com:443/v1/traces
```

**Correct:**
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingress.ap1.coralogix.com/v1/traces
```

### 4. **Wrong Coralogix Region**

Make sure you're using the correct endpoint for your Coralogix region:

| Region | Endpoint |
|--------|----------|
| **Singapore (AP1)** | `https://ingress.ap1.coralogix.com/v1/traces` |
| **India (AP2)** | `https://ingress.coralogix.in/v1/traces` |
| **US1** | `https://ingress.coralogix.us/v1/traces` |
| **EU1** | `https://ingress.coralogix.com/v1/traces` |
| **EU2** | `https://ingress.eu2.coralogix.com/v1/traces` |

### 5. **Invalid Private Key**

Verify your Coralogix private key:
- Should start with `cxtp_`
- Should be a valid key from your Coralogix account
- Check in Coralogix: Settings → Send Your Data → API Keys

### 6. **Missing Authorization Header**

The exporter must include the Authorization header:

```typescript
headers: {
  'Authorization': `Bearer ${process.env.CORALOGIX_PRIVATE_KEY}`,
}
```

## Solution Applied

We've fixed your configuration:

### Updated `backend/.env`:
```bash
# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingress.ap1.coralogix.com/v1/traces
CORALOGIX_PRIVATE_KEY=cxtp_Nb8SaWBuK9odW1fke9eO6eHnVTapzU

# Coralogix Application Configuration
CORALOGIX_APPLICATION_NAME=cx-rum-demo
CORALOGIX_SUBSYSTEM_NAME=backend

# Service Information
SERVICE_NAME=cx-rum-backend
SERVICE_VERSION=1.0.0
```

### Updated `backend/src/instrumentation.ts`:
- Removed `:443` port from endpoint
- Added `timeoutMillis: 15000` for better reliability
- Added Coralogix-specific resource attributes:
  - `cx.application.name`
  - `cx.subsystem.name`

## Testing the Fix

### 1. Restart the Backend

```bash
cd backend
npm run dev
```

### 2. Expected Console Output

You should see:
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

### 3. Make a Test Request

```bash
curl http://localhost:3001/api/products
```

### 4. Check for Errors

If you still see 403 errors in the console, check:
1. Your Coralogix private key is valid
2. Your Coralogix region endpoint is correct
3. Your network can reach the Coralogix endpoint

### 5. Verify in Coralogix

1. Login to Coralogix dashboard
2. Navigate to **Explore** → **Traces**
3. Filter by service: `cx-rum-backend`
4. You should see traces appearing!

## Additional Debugging

### Enable More Verbose Logging

The instrumentation already has `DiagLogLevel.INFO` enabled. If you need more details, you can change it to `DEBUG`:

```typescript
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

### Test with cURL

Test the Coralogix endpoint directly:

```bash
curl -X POST https://ingress.ap1.coralogix.com/v1/traces \
  -H "Authorization: Bearer cxtp_Nb8SaWBuK9odW1fke9eO6eHnVTapzU" \
  -H "Content-Type: application/x-protobuf" \
  -d ""
```

You should get a response (even if empty data), not a 403.

## Reference

- [Coralogix Node.js OpenTelemetry Documentation](https://coralogix.com/docs/opentelemetry/instrumentation-options/nodejs-opentelemetry-instrumentation/)
- [Coralogix Endpoints](https://coralogix.com/docs/coralogix-endpoints/)

## Summary

The main issue was:
1. ❌ Missing `https://` protocol
2. ❌ Including `:443` port in HTTP endpoint

Fixed to:
1. ✅ `https://ingress.ap1.coralogix.com/v1/traces`
2. ✅ Added Coralogix-specific resource attributes
3. ✅ Added timeout configuration

Your backend should now successfully send traces to Coralogix! 🎉

