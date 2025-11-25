'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  Divider,
  UnorderedList,
  ListItem,
  Code,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { trackCustomEvent } from '@/lib/coralogix';

export default function FrontendDocsPage() {
  useEffect(() => {
    trackCustomEvent('page_view', { page: 'frontend_docs' });
  }, []);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const codeColor = useColorModeValue('purple.500', 'purple.300');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" py={10}>
          <Heading as="h1" size="2xl" mb={4}>
            Frontend Documentation
          </Heading>
          <Text fontSize="xl" color="gray.500">
            A comprehensive guide to the Next.js frontend with Coralogix RUM instrumentation
          </Text>
        </Box>

        <Box p={6} borderRadius="lg" bg={bgColor} boxShadow="md" borderWidth="1px" borderColor={borderColor}>
          <Heading as="h2" size="lg" mb={4}>
            Overview
          </Heading>
          <Text mb={4}>
            This frontend application is built with Next.js and TypeScript, featuring Chakra UI for styling and Coralogix RUM SDK for real user monitoring. The application demonstrates how to implement distributed tracing across a full-stack application.
          </Text>
          <HStack spacing={4} mt={4} wrap="wrap">
            <Badge colorScheme="blue" p={2} borderRadius="md">Next.js 14</Badge>
            <Badge colorScheme="green" p={2} borderRadius="md">TypeScript</Badge>
            <Badge colorScheme="purple" p={2} borderRadius="md">Chakra UI</Badge>
            <Badge colorScheme="orange" p={2} borderRadius="md">Coralogix RUM</Badge>
            <Badge colorScheme="red" p={2} borderRadius="md">Distributed Tracing</Badge>
          </HStack>
        </Box>

        <Accordion allowMultiple defaultIndex={[0]}>
          <AccordionItem borderWidth="1px" borderRadius="lg" mb={4} overflow="hidden">
            <h2>
              <AccordionButton bg={sectionBg} py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                  Project Structure
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={4}>
                The frontend project follows the Next.js App Router structure:
              </Text>
              <Box p={4} bg="gray.900" color="white" borderRadius="md" fontFamily="mono" fontSize="sm" overflowX="auto">
                <pre>
{`frontend/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── about/       # About page
│   │   ├── docs/        # Documentation pages
│   │   ├── products/    # Products pages
│   │   ├── users/       # Users pages
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Home page
│   ├── components/      # React components
│   │   ├── ClientLayout.tsx
│   │   ├── CoralogixInitializer.tsx
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   ├── lib/             # Utility functions
│   │   ├── api.ts       # API client
│   │   ├── chakra.tsx   # Chakra UI provider
│   │   └── coralogix.ts # Coralogix RUM initialization
│   └── types/           # TypeScript type definitions
│       └── global.d.ts  # Global type declarations
├── .env                 # Environment variables
├── .env.example         # Example environment variables
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration`}
                </pre>
              </Box>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem borderWidth="1px" borderRadius="lg" mb={4} overflow="hidden">
            <h2>
              <AccordionButton bg={sectionBg} py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                  Coralogix RUM Integration
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={4}>
                The frontend is instrumented with Coralogix RUM SDK to track user interactions, page loads, API calls, and errors. This provides visibility into the user experience and enables distributed tracing.
              </Text>
              
              <Heading as="h4" size="md" mt={6} mb={3}>
                Initialization
              </Heading>
              <Text mb={3}>
                Coralogix RUM is initialized in <Code colorScheme="purple">src/lib/coralogix.ts</Code>:
              </Text>
              <Box p={4} bg="gray.900" color="white" borderRadius="md" fontFamily="mono" fontSize="sm" overflowX="auto" mb={4}>
                <pre>
{`import { CoralogixRum, CoralogixLogSeverity } from '@coralogix/browser';

export function initCoralogix() {
  if (typeof window === 'undefined') {
    return;
  }

  CoralogixRum.init({
    public_key: process.env.NEXT_PUBLIC_CORALOGIX_KEY || 'your-key',
    application: process.env.NEXT_PUBLIC_CORALOGIX_APPLICATION_NAME || 'app-name',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    coralogixDomain: 'AP1',
    traceParentInHeader: {
      enabled: true,
      options: {
        propagateTraceHeaderCorsUrls: [new RegExp('http://localhost:3001.*')],
        allowedTracingUrls: [new RegExp('.*')]
      }
    }
  });
}`}
                </pre>
              </Box>
              
              <Heading as="h4" size="md" mt={6} mb={3}>
                Trace Context Propagation
              </Heading>
              <Text mb={3}>
                The trace context is propagated from the frontend to the backend using the <Code colorScheme="purple">traceparent</Code> header:
              </Text>
              <Box p={4} bg="gray.900" color="white" borderRadius="md" fontFamily="mono" fontSize="sm" overflowX="auto">
                <pre>
{`// Add request interceptor to ensure trace context propagation
api.interceptors.request.use((config) => {
  // Get the trace context from the window object if available
  if (typeof window !== 'undefined' && window.CoralogixRum) {
    try {
      const traceContext = window.CoralogixRum.getTraceContext?.();
      if (traceContext && traceContext.traceparent) {
        // Add traceparent header to the request
        config.headers['traceparent'] = traceContext.traceparent;
      }
    } catch (error) {
      console.error('Error getting trace context:', error);
    }
  }
  
  return config;
});`}
                </pre>
              </Box>
              
              <Alert status="info" mt={4} borderRadius="md">
                <AlertIcon />
                The <Code colorScheme="purple">traceparent</Code> header follows the W3C Trace Context specification and contains the trace ID, span ID, and trace flags.
              </Alert>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem borderWidth="1px" borderRadius="lg" mb={4} overflow="hidden">
            <h2>
              <AccordionButton bg={sectionBg} py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                  API Integration
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={4}>
                The frontend communicates with the backend API using Axios. The API client is defined in <Code colorScheme="purple">src/lib/api.ts</Code>.
              </Text>
              
              <Heading as="h4" size="md" mt={6} mb={3}>
                API Client
              </Heading>
              <Box p={4} bg="gray.900" color="white" borderRadius="md" fontFamily="mono" fontSize="sm" overflowX="auto" mb={4}>
                <pre>
{`import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const fetchProducts = async () => {
  const response = await api.get('/api/products');
  return response.data;
};

export const fetchProduct = async (id: number) => {
  const response = await api.get(\`/api/products/\${id}\`);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await api.get('/api/users');
  return response.data;
};

export const fetchUser = async (id: number) => {
  const response = await api.get(\`/api/users/\${id}\`);
  return response.data;
};`}
                </pre>
              </Box>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem borderWidth="1px" borderRadius="lg" mb={4} overflow="hidden">
            <h2>
              <AccordionButton bg={sectionBg} py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                  Environment Variables
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={4}>
                The frontend uses the following environment variables:
              </Text>
              
              <TableContainer>
                <Table variant="simple" mb={4}>
                  <Thead>
                    <Tr>
                      <Th>Variable</Th>
                      <Th>Description</Th>
                      <Th>Default</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td><Code>NEXT_PUBLIC_API_URL</Code></Td>
                      <Td>URL of the backend API</Td>
                      <Td>http://localhost:3001</Td>
                    </Tr>
                    <Tr>
                      <Td><Code>NEXT_PUBLIC_CORALOGIX_KEY</Code></Td>
                      <Td>Coralogix RUM public key</Td>
                      <Td>-</Td>
                    </Tr>
                    <Tr>
                      <Td><Code>NEXT_PUBLIC_CORALOGIX_APPLICATION_NAME</Code></Td>
                      <Td>Application name for Coralogix RUM</Td>
                      <Td>cx-rum-fullstack-ts</Td>
                    </Tr>
                    <Tr>
                      <Td><Code>NEXT_PUBLIC_CORALOGIX_DOMAIN</Code></Td>
                      <Td>Coralogix domain (AP1, EU1, etc.)</Td>
                      <Td>AP1</Td>
                    </Tr>
                    <Tr>
                      <Td><Code>NEXT_PUBLIC_APP_VERSION</Code></Td>
                      <Td>Application version</Td>
                      <Td>1.0.0</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
              
              <Text mb={3}>
                These variables should be defined in a <Code colorScheme="purple">.env</Code> file in the frontend directory:
              </Text>
              <Box p={4} bg="gray.900" color="white" borderRadius="md" fontFamily="mono" fontSize="sm" overflowX="auto">
                <pre>
{`# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Coralogix RUM Configuration
NEXT_PUBLIC_CORALOGIX_KEY=your-coralogix-public-key
NEXT_PUBLIC_CORALOGIX_APPLICATION_NAME=cx-rum-fullstack-ts
NEXT_PUBLIC_CORALOGIX_DOMAIN=AP1
NEXT_PUBLIC_APP_VERSION=1.0.0`}
                </pre>
              </Box>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem borderWidth="1px" borderRadius="lg" mb={4} overflow="hidden">
            <h2>
              <AccordionButton bg={sectionBg} py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                  Running the Frontend
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={4}>
                To run the frontend application:
              </Text>
              
              <UnorderedList spacing={3} mb={4}>
                <ListItem>
                  <Text>
                    Install dependencies:
                    <Code colorScheme="purple" ml={2}>npm install</Code>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Start the development server:
                    <Code colorScheme="purple" ml={2}>npm run dev</Code>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Build for production:
                    <Code colorScheme="purple" ml={2}>npm run build</Code>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Start the production server:
                    <Code colorScheme="purple" ml={2}>npm run start</Code>
                  </Text>
                </ListItem>
              </UnorderedList>
              
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                Make sure the backend server is running before starting the frontend application.
              </Alert>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Container>
  );
}
