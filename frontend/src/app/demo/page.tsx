'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Code,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
} from '@chakra-ui/react';
import {
  fetchDemoCustomSpans,
  fetchDemoSpanEvents,
  fetchDemoErrorHandling,
  fetchDemoContextPropagation,
  fetchDemoBaggage,
} from '@/lib/api';
import { trackCustomEvent } from '@/lib/coralogix';

interface DemoResult {
  demo: string;
  description: string;
  [key: string]: any;
}

interface DemoConfig {
  id: string;
  title: string;
  description: string;
  concepts: string[];
  endpoint: string;
  fetchFn: (param?: boolean) => Promise<DemoResult>;
  hasFailMode?: boolean;
}

const demos: DemoConfig[] = [
  {
    id: 'custom-spans',
    title: '1. Custom Child Spans',
    description: 'Creating nested parent-child spans for tracking sub-operations (DB query + cache)',
    concepts: ['startActiveSpan', 'nested spans', 'span hierarchy'],
    endpoint: '/api/demo/custom-spans',
    fetchFn: fetchDemoCustomSpans,
  },
  {
    id: 'span-events',
    title: '2. Span Events & Attributes',
    description: 'Adding events and attributes (string, number, boolean) to spans',
    concepts: ['setAttribute', 'addEvent', 'attribute types'],
    endpoint: '/api/demo/span-events',
    fetchFn: fetchDemoSpanEvents,
  },
  {
    id: 'error-handling',
    title: '3. Error Handling',
    description: 'Proper error recording with recordException() and setStatus()',
    concepts: ['recordException', 'setStatus', 'SpanStatusCode'],
    endpoint: '/api/demo/error-handling',
    fetchFn: fetchDemoErrorHandling,
    hasFailMode: true,
  },
  {
    id: 'context-propagation',
    title: '4. Context Propagation',
    description: 'Trace context flow through sequential and parallel async operations',
    concepts: ['context propagation', 'async/await', 'parallel operations'],
    endpoint: '/api/demo/context-propagation',
    fetchFn: fetchDemoContextPropagation,
  },
  {
    id: 'baggage',
    title: '5. Baggage Usage',
    description: 'Reading and using W3C Baggage for cross-cutting concerns',
    concepts: ['getBaggage', 'cross-cutting concerns', 'correlation'],
    endpoint: '/api/demo/baggage',
    fetchFn: fetchDemoBaggage,
  },
];

export default function DemoPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, DemoResult | null>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const runDemo = async (demo: DemoConfig, failMode: boolean = false) => {
    const demoKey = failMode ? `${demo.id}-fail` : demo.id;
    setLoading(demoKey);
    setErrors({ ...errors, [demoKey]: null });
    
    trackCustomEvent('demo_triggered', { 
      demo: demo.id, 
      failMode,
      endpoint: demo.endpoint 
    });

    try {
      const result = await demo.fetchFn(failMode);
      setResults({ ...results, [demoKey]: result });
      toast({
        title: `${demo.title} completed`,
        description: 'Check backend console for detailed span logs',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setErrors({ ...errors, [demoKey]: errorMsg });
      if (failMode) {
        toast({
          title: 'Error recorded on span',
          description: 'Check backend console for error span details',
          status: 'info',
          duration: 3000,
        });
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center" mb={4}>
          <Heading size="xl" mb={2}>🔬 Manual Instrumentation Demos</Heading>
          <Text color="gray.500">
            OpenTelemetry manual instrumentation examples - watch backend console for detailed logs
          </Text>
        </Box>

        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">
            Each demo creates custom spans with detailed logging. Open your <strong>backend terminal</strong> to see trace IDs, span hierarchies, and attributes being set in real-time.
          </Text>
        </Alert>

        <Accordion allowMultiple defaultIndex={[0, 1, 2, 3, 4]}>
          {demos.map((demo) => (
            <AccordionItem key={demo.id} border="1px" borderColor={borderColor} borderRadius="md" mb={3}>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left">
                  <Heading size="md">{demo.title}</Heading>
                  <Text fontSize="sm" color="gray.500" mt={1}>{demo.description}</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} bg={cardBg}>
                <VStack align="stretch" spacing={4}>
                  <HStack wrap="wrap" spacing={2}>
                    <Text fontSize="sm" fontWeight="bold">Concepts:</Text>
                    {demo.concepts.map((concept) => (
                      <Badge key={concept} colorScheme="purple" variant="subtle">
                        {concept}
                      </Badge>
                    ))}
                  </HStack>

                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>Endpoint:</Text>
                    <Code colorScheme="blue" p={2} borderRadius="md" display="block">
                      GET {demo.endpoint}
                    </Code>
                  </Box>

                  <HStack spacing={3}>
                    <Button
                      colorScheme="brand"
                      onClick={() => runDemo(demo)}
                      isLoading={loading === demo.id}
                      loadingText="Running..."
                      leftIcon={loading === demo.id ? <Spinner size="sm" /> : undefined}
                    >
                      Run Demo
                    </Button>
                    {demo.hasFailMode && (
                      <Button
                        colorScheme="red"
                        variant="outline"
                        onClick={() => runDemo(demo, true)}
                        isLoading={loading === `${demo.id}-fail`}
                        loadingText="Running..."
                      >
                        Run with Error
                      </Button>
                    )}
                  </HStack>

                  {/* Success Result */}
                  {results[demo.id] && (
                    <Box bg="green.50" p={3} borderRadius="md" borderLeft="4px" borderColor="green.400">
                      <Text fontSize="sm" fontWeight="bold" color="green.700" mb={1}>✅ Result:</Text>
                      <Code display="block" whiteSpace="pre-wrap" fontSize="xs" p={2} bg="white" borderRadius="md">
                        {JSON.stringify(results[demo.id], null, 2)}
                      </Code>
                    </Box>
                  )}

                  {/* Error Result (for fail mode) */}
                  {results[`${demo.id}-fail`] && (
                    <Box bg="orange.50" p={3} borderRadius="md" borderLeft="4px" borderColor="orange.400">
                      <Text fontSize="sm" fontWeight="bold" color="orange.700" mb={1}>⚠️ Error Recorded:</Text>
                      <Code display="block" whiteSpace="pre-wrap" fontSize="xs" p={2} bg="white" borderRadius="md">
                        {JSON.stringify(results[`${demo.id}-fail`], null, 2)}
                      </Code>
                    </Box>
                  )}

                  {/* Actual Error */}
                  {errors[demo.id] && (
                    <Box bg="red.50" p={3} borderRadius="md" borderLeft="4px" borderColor="red.400">
                      <Text fontSize="sm" fontWeight="bold" color="red.700" mb={1}>❌ Error:</Text>
                      <Text fontSize="sm" color="red.600">{errors[demo.id]}</Text>
                    </Box>
                  )}
                  {errors[`${demo.id}-fail`] && (
                    <Box bg="red.50" p={3} borderRadius="md" borderLeft="4px" borderColor="red.400">
                      <Text fontSize="sm" fontWeight="bold" color="red.700" mb={1}>❌ Expected Error (check backend logs):</Text>
                      <Text fontSize="sm" color="red.600">{errors[`${demo.id}-fail`]}</Text>
                    </Box>
                  )}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

        <Box bg={cardBg} p={6} borderRadius="lg" border="1px" borderColor={borderColor}>
          <Heading size="sm" mb={3}>📋 What to Look For in Backend Logs</Heading>
          <VStack align="stretch" spacing={2} fontSize="sm">
            <Text>• <strong>Trace ID</strong> - Same across all spans in a request (enables correlation)</Text>
            <Text>• <strong>Span ID</strong> - Unique identifier for each operation</Text>
            <Text>• <strong>Parent Span ID</strong> - Shows the span hierarchy</Text>
            <Text>• <strong>Attributes</strong> - Custom key-value pairs added to spans</Text>
            <Text>• <strong>Events</strong> - Timestamped logs within a span</Text>
            <Text>• <strong>Status</strong> - OK or ERROR with message</Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}

