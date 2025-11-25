import { CoralogixRum, CoralogixLogSeverity } from '@coralogix/browser';

export function initCoralogix() {
  if (typeof window === 'undefined') {
    return;
  }

  CoralogixRum.init({
    public_key: process.env.NEXT_PUBLIC_CORALOGIX_KEY || 'cxtp_h67xJ812vw45cbSghb1MbgGD9RgLqX',
    application: process.env.NEXT_PUBLIC_CORALOGIX_APPLICATION_NAME || 'cx-webapp-new',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '6.0.0',
    coralogixDomain: (process.env.NEXT_PUBLIC_CORALOGIX_DOMAIN as any) || 'AP1',
    // sessionConfig: {
    //   sessionSampleRate: 50, // Percentage of overall sessions being tracked, defaults to 100%
    //  alwaysTrackSessionsWithErrors: true,
    // },
    traceParentInHeader: {
      enabled: true,
      options: {
        propagateTraceHeaderCorsUrls: [new RegExp('.*')],
        allowedTracingUrls: [new RegExp('.*')]
      }
    },
    // instrumentations: {
    // xhr: true,
    // fetch: true,
    // web_vitals: false,
    // interactions: false,
    // custom: true,
    // errors: true,
    // long_tasks: true,
    // resources: false,
    // },

    
    // sessionRecordingConfig: {
    //   enable: true, // Must declare.
    //   /**
    //    * If autoStartSessionRecording is false, you can manually start & stop your session recording.
    //    * Refer to Recording Manually Section.
    //    **/
    //   autoStartSessionRecording: true, // Automatically records your session when SDK is up.
    //   recordConsoleEvents: true, // Will record all console events from dev tools. Levels: log, debug, warn, error, info, table etc..
    //   sessionRecordingSampleRate: 100, // Percentage of overall sessions recording being tracked, defaults to 100% and applied after the overall sessionSampleRate.
    // },
  });

  console.log('Coralogix RUM initialized');

  // Set up global error handlers for unhandled errors
  setupGlobalErrorHandlers();
}

// Global error handlers to catch unhandled errors
function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') {
    return;
  }

  // Handle unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    captureCustomError(event.error || new Error(event.message), {
      errorType: 'global_unhandled_error',
      timestamp: new Date().toISOString(),
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    captureCustomError(error, {
      errorType: 'global_unhandled_promise_rejection',
      timestamp: new Date().toISOString(),
      reason: String(event.reason),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  });
}

// send custom logs with different severity levels


// send custom logs with extra data and labels




export function trackCustomEvent(name: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    // Use the correct method for custom events
    CoralogixRum.log(CoralogixLogSeverity.Info, name, data);
  }
}

export function getTraceContext() {
  if (typeof window !== 'undefined' && CoralogixRum) {
    // The trace context is automatically added to network requests
    // when traceParentInHeader is enabled
    return true;
  }
  return null;
}

// Custom error handling functions for demonstration purposes
export function captureCustomError(error: Error, context?: Record<string, any>) {
  if (typeof window !== 'undefined' && CoralogixRum) {
    try {
      CoralogixRum.captureError(error, { custom_data: context });
      console.log('Custom error captured:', error.message);
    } catch (err) {
      console.error('Failed to capture error:', err);
    }
  }
}

export function logCustomError(message: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined' && CoralogixRum) {
    try {
      CoralogixRum.log(CoralogixLogSeverity.Error, message, data);
      console.log('Custom error logged:', message);
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }
}

export function logCustomWarning(message: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined' && CoralogixRum) {
    try {
      // Use Info level since Warning might not be available
      CoralogixRum.log(CoralogixLogSeverity.Info, `WARNING: ${message}`, data);
      console.log('Custom warning logged:', message);
    } catch (err) {
      console.error('Failed to log warning:', err);
    }
  }
}

// Error simulation functions for testing - these generate REAL errors with actual stack traces
export function simulateJavaScriptError() {
  // Create a real error that will have an actual stack trace
  const error = new Error('Simulated JavaScript Error: This is a test error for Coralogix visualization');

  // Capture the error with context before throwing
  captureCustomError(error, {
    errorType: 'simulated_javascript_error',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    feature: 'error_simulation',
    severity: 'high'
  });

  // Throw the real error - this will generate an actual stack trace
  throw error;
}

export function simulateAsyncError() {
  setTimeout(() => {
    // Create a real error with actual stack trace
    const error = new Error('Simulated Async Error: This error occurred in an async operation');

    captureCustomError(error, {
      errorType: 'simulated_async_error',
      timestamp: new Date().toISOString(),
      asyncOperation: 'setTimeout',
      delay: 1000,
      feature: 'async_error_simulation',
      severity: 'medium'
    });

    // This will be caught by the global error handler and show real stack trace
    throw error;
  }, 1000);
}

export function simulateNetworkError() {
  // Create a real network-like error
  const error = new Error('Simulated Network Error: Failed to fetch data from API');
  error.name = 'NetworkError';

  captureCustomError(error, {
    errorType: 'simulated_network_error',
    timestamp: new Date().toISOString(),
    endpoint: '/api/products',
    method: 'GET',
    statusCode: 500,
    feature: 'network_error_simulation',
    severity: 'high',
    category: 'api_error'
  });

  // Don't throw this one as it's meant to simulate a caught network error
  console.error('Network error simulated:', error);
}

export function simulateValidationError() {
  // Create a real validation error
  const error = new Error('Simulated Validation Error: Invalid user input detected');
  error.name = 'ValidationError';

  captureCustomError(error, {
    errorType: 'simulated_validation_error',
    timestamp: new Date().toISOString(),
    fieldName: 'email',
    inputValue: 'invalid-email',
    validationRule: 'email_format',
    feature: 'validation_error_simulation',
    severity: 'low',
    category: 'user_input_error'
  });

  // Don't throw this one as it's meant to simulate a handled validation error
  console.warn('Validation error simulated:', error);
}

// Additional error simulation functions that generate real stack traces
export function simulateTypeError() {
  try {
    // This will generate a real TypeError with actual stack trace
    const obj: any = null;
    obj.someProperty.nestedProperty = 'value'; // This will throw TypeError
  } catch (error) {
    captureCustomError(error as Error, {
      errorType: 'simulated_type_error',
      timestamp: new Date().toISOString(),
      feature: 'type_error_simulation',
      severity: 'high'
    });
    throw error; // Re-throw to show in console with real stack trace
  }
}

export function simulateReferenceError() {
  try {
    // This will generate a real ReferenceError with actual stack trace
    // @ts-ignore - Intentionally accessing undefined variable
    console.log(undefinedVariable);
  } catch (error) {
    captureCustomError(error as Error, {
      errorType: 'simulated_reference_error',
      timestamp: new Date().toISOString(),
      feature: 'reference_error_simulation',
      severity: 'high'
    });
    throw error; // Re-throw to show in console with real stack trace
  }
}

export function simulatePromiseRejection() {
  // Create a promise that will be rejected with real stack trace
  const promise = new Promise((_resolve, reject) => {
    setTimeout(() => {
      const error = new Error('Simulated Promise Rejection: Async operation failed');
      reject(error);
    }, 500);
  });

  // Don't catch it - let it become an unhandled rejection
  promise.then(() => {
    console.log('This should not execute');
  });

  console.log('Promise rejection will occur in 500ms - check console and Coralogix');
}

export function simulateDeepStackError() {
  // Create a deep call stack to show multiple levels in stack trace
  function level1() {
    level2();
  }

  function level2() {
    level3();
  }

  function level3() {
    level4();
  }

  function level4() {
    const error = new Error('Deep Stack Error: Error from nested function calls');
    captureCustomError(error, {
      errorType: 'simulated_deep_stack_error',
      timestamp: new Date().toISOString(),
      feature: 'deep_stack_simulation',
      severity: 'medium',
      stackDepth: 4
    });
    throw error;
  }

  level1();
}
