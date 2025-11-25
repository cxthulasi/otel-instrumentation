// Load environment variables FIRST before anything else
import dotenv from 'dotenv';
dotenv.config();

// Import gRPC before OpenTelemetry to avoid instrumentation warnings
import { credentials, Metadata } from '@grpc/grpc-js';

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Enable diagnostic logging for OpenTelemetry
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

console.log('=== OpenTelemetry Configuration ===');
console.log('Protocol: gRPC');
console.log('OTEL Endpoint:', process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'ingress.ap1.coralogix.com:443');
console.log('Service Name:', process.env.SERVICE_NAME || 'cx-rum-backend');
console.log('Service Version:', process.env.SERVICE_VERSION || '1.0.0');
console.log('Coralogix Key:', process.env.CORALOGIX_PRIVATE_KEY ? '***' + process.env.CORALOGIX_PRIVATE_KEY.slice(-4) : 'NOT SET');
console.log('===================================');

// Configure the SDK to export telemetry data to Coralogix using gRPC
// Note: For gRPC, use metadata instead of headers for authorization
const metadata = new Metadata();
metadata.set('Authorization', `Bearer ${process.env.CORALOGIX_PRIVATE_KEY || 'your-coralogix-private-key'}`);

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'ingress.ap1.coralogix.com:443',
  metadata,
  credentials: credentials.createSsl(),
  timeoutMillis: 15000,
});

// Create Resource with Coralogix-specific attributes
const resource = resourceFromAttributes({
  'service.name': process.env.SERVICE_NAME || 'cx-rum-backend',
  'service.version': process.env.SERVICE_VERSION || '1.0.0',
  // Coralogix-specific attributes - REQUIRED for traces to appear in Coralogix
  'cx.application.name': process.env.CORALOGIX_APPLICATION_NAME || 'cx-rum-demo',
  'cx.subsystem.name': process.env.CORALOGIX_SUBSYSTEM_NAME || 'backend',
});

// Initialize the SDK
export const otelSDK = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-express': { enabled: true },
    }),
  ],
});

// Start the SDK
try {
  otelSDK.start();
  console.log('✅ OpenTelemetry instrumentation initialized successfully');
  console.log('📡 Traces will be sent to Coralogix');
} catch (error) {
  console.error('❌ Error initializing OpenTelemetry instrumentation:', error);
}

// Gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  try {
    otelSDK.shutdown();
    console.log('OpenTelemetry SDK shut down successfully');
  } catch (error) {
    console.error('Error shutting down OpenTelemetry SDK:', error);
  } finally {
    process.exit(0);
  }
});
