# Error Testing Guide

This document provides instructions for testing the custom error handling and stack trace generation features that have been added to the frontend application.

## What Was Added

### 1. Enhanced Coralogix Library (`src/lib/coralogix.ts`)
- `captureCustomError()` - Captures errors with custom context data
- `logCustomError()` - Logs custom error messages
- `logCustomWarning()` - Logs custom warning messages
- `simulateJavaScriptError()` - Simulates a JavaScript error with stack trace
- `simulateAsyncError()` - Simulates an async error (setTimeout)
- `simulateNetworkError()` - Simulates a network/API error
- `simulateValidationError()` - Simulates a validation error
- Global error handlers for unhandled errors and promise rejections

### 2. Error Boundary Component (`src/components/ErrorBoundary.tsx`)
- Catches React component errors
- Automatically sends error details to Coralogix
- Provides a fallback UI when errors occur

### 3. Error Simulator Component (`src/components/ErrorSimulator.tsx`)
- Interactive UI for testing different types of errors
- Compact mode for easy integration into existing pages
- Tooltips explaining each error type

### 4. React Error Trigger (`src/components/ReactErrorTrigger.tsx`)
- Component that can trigger React errors for Error Boundary testing

## How to Test

### 1. Start the Application
```bash
cd frontend
npm run dev
```

### 2. Navigate to Any Page
The Error Simulator has been added to:
- Home page (`/`)
- Products page (`/products`)
- Users page (`/users`)

### 3. Test Different Error Types

#### Basic Error Types
1. **JS Error** - Throws a basic JavaScript error
2. **Async Error** - Error in setTimeout (caught by global handler)
3. **Network Error** - Simulated API failure (logged, not thrown)
4. **Validation Error** - Simulated form validation error (logged, not thrown)
5. **React Error** - Component error caught by Error Boundary

#### Real Stack Trace Errors (Purple Buttons)
These generate **actual JavaScript errors** with **real source code locations**:

1. **TypeError** - Attempts to access property of null
   - Generates real TypeError with actual line numbers
   - Shows exact source code location in Coralogix

2. **ReferenceError** - Accesses undefined variable
   - Generates real ReferenceError with actual stack trace
   - Points to exact source file and line

3. **Promise Rejection** - Unhandled promise rejection
   - Creates real unhandled rejection after 500ms
   - Caught by global unhandledrejection handler
   - Shows actual async stack trace

4. **Deep Stack** - Error from nested function calls
   - Creates 4-level deep call stack
   - Shows complete call hierarchy in stack trace
   - Each level visible in Coralogix with source locations

#### Custom Logs
1. Click "Custom Error" to log a custom error message
2. Click "Custom Warning" to log a custom warning message
3. Click "Custom Event" to track a custom event
4. All will appear in Coralogix with custom context data

## Error Context Data

Each error includes rich context information:
- `errorType` - Type of error (e.g., 'simulated_javascript_error')
- `timestamp` - When the error occurred
- `url` - Current page URL
- `userAgent` - Browser information
- `feature` - Which feature generated the error
- `severity` - Error severity level
- Additional context specific to each error type

## Stack Traces and Source Maps

### Real Stack Traces
The new error simulation functions generate **actual JavaScript errors** with real stack traces that show:
- **Exact source file locations** (e.g., `coralogix.ts:245:12`)
- **Function names** from your actual code
- **Line and column numbers** pointing to real source code
- **Complete call hierarchy** showing how the error propagated

### Source Map Support
- Next.js is configured with `productionBrowserSourceMaps: true`
- Source maps allow Coralogix to show the original TypeScript source code
- Even in production builds, you'll see the actual source lines where errors occurred
- Stack traces will reference your `.ts` files, not compiled `.js` files

### What You'll See in Coralogix
Instead of generic stack traces, you'll now see:
```
TypeError: Cannot read properties of null (reading 'someProperty')
    at simulateTypeError (coralogix.ts:245:12)
    at handleTypeError (ErrorSimulator.tsx:67:8)
    at onClick (ErrorSimulator.tsx:258:45)
    at HTMLButtonElement.callCallback (react-dom.js:3945:14)
```

This shows the **exact line in your source code** where the error occurred!

## Coralogix Integration

Errors are sent to Coralogix using:
- `CoralogixRum.captureError()` for Error objects
- `CoralogixRum.log()` for custom messages
- Automatic trace context correlation with backend requests

## Rollback Instructions

If you need to revert these changes:

1. Remove the Error Simulator from pages:
   - Remove `<ErrorSimulator compact />` from `src/app/page.tsx`
   - Remove `<ErrorSimulator compact />` from `src/app/products/page.tsx`
   - Remove `<ErrorSimulator compact />` from `src/app/users/page.tsx`

2. Remove Error Boundary wrappers:
   - Remove `<ErrorBoundary>` and `</ErrorBoundary>` from the same files

3. Remove the new components:
   - Delete `src/components/ErrorBoundary.tsx`
   - Delete `src/components/ErrorSimulator.tsx`
   - Delete `src/components/ReactErrorTrigger.tsx`

4. Revert `src/lib/coralogix.ts` to its original state by removing:
   - All functions after `getTraceContext()`
   - The `setupGlobalErrorHandlers()` call in `initCoralogix()`

The core functionality of the application will remain unchanged.
