interface Window {
  CoralogixRum?: {
    getTraceContext?: () => { traceparent?: string } | null;
    init: (config: any) => void;
    log: (severity: any, message: string, data?: Record<string, any>) => void;
  };
}
