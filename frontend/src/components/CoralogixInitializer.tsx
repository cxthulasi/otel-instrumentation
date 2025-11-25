'use client';

import { useEffect } from 'react';
import { initCoralogix } from '@/lib/coralogix';

export function CoralogixInitializer() {
  useEffect(() => {
    // Initialize Coralogix RUM on the client side
    console.log('Initializing Coralogix RUM from client component...');
    initCoralogix();
    console.log('Coralogix RUM initialized from client component');
    
    // Log window.CoralogixRum availability
    if (typeof window !== 'undefined') {
      console.log('window.CoralogixRum available:', !!window.CoralogixRum);
      if (window.CoralogixRum && window.CoralogixRum.getTraceContext) {
        console.log('getTraceContext method available');
        const traceContext = window.CoralogixRum.getTraceContext();
        console.log('Trace context:', traceContext);
      } else {
        console.log('getTraceContext method not available');
      }
    }
  }, []);

  

  return null; // This component doesn't render anything
}
