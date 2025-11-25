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
  Image,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { trackCustomEvent } from '@/lib/coralogix';

export default function BackendDocsPage() {
  useEffect(() => {
    trackCustomEvent('page_view', { page: 'backend_docs' });
  }, []);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const codeColor = useColorModeValue('teal.500', 'teal.300');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" py={10}>
          <Heading as="h1" size="2xl" mb={4}>
            Backend Documentation
          </Heading>
          <Text fontSize="xl" color="gray.500">
            A comprehensive guide to the Node.js backend with OpenTelemetry instrumentation
          </Text>
        </Box>

        <Box p={6} borderRadius="lg" bg={bgColor} boxShadow="md" borderWidth="1px" borderColor={borderColor}>
          <Heading as="h2" size="lg" mb={4}>
            Overview
          </Heading>
          <Text mb={4}>
            This backend application is built with Node.js and Express, using TypeScript for type safety. It features OpenTelemetry instrumentation for distributed tracing and connects to JSONPlaceholder for mock data.
          </Text>
          <HStack spacing={4} mt={4} wrap="wrap">
            <Badge colorScheme="green" p={2} borderRadius="md">Node.js</Badge>
            <Badge colorScheme="blue" p={2} borderRadius="md">TypeScript</Badge>
            <Badge colorScheme="cyan" p={2} borderRadius="md">Express</Badge>
            <Badge colorScheme="orange" p={2} borderRadius="md">OpenTelemetry</Badge>
            <Badge colorScheme="purple" p={2} borderRadius="md">Distributed Tracing</Badge>
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
                The backend project follows a standard Node.js structure:
              </Text>
              <Box p={4} bg="gray.900" color="white" borderRadius="md" fontFamily="mono" fontSize="sm" overflowX="auto">
                <pre>
{`backend/
├── src/
│   ├── index-simple.ts       # Main application entry point (without OpenTelemetry)
│   ├── index.ts              # Main application entry point (with OpenTelemetry)
│   └── instrumentation.ts    # OpenTelemetry instrumentation
├── dist/                     # Compiled JavaScript files
├── .env                      # Environment variables
├── .env.example              # Example environment variables
├── package.json              # Project dependencies
└── tsconfig.json             # TypeScript configuration`}
                </pre>
              </Box>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem borderWidth="1px" borderRadius="lg" mb={4} overflow="hidden">
            <h2>
              <AccordionButton bg={sectionBg} py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                  OpenTelemetry Integration
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={4}>
                The backend is instrumented with OpenTelemetry to capture API calls and other operations. This enables distributed tracing and correlation with the frontend.
              </Text>
              
              <Heading as="h4" size="md" mt={6} mb={3}>
                Instrumentation Setup
              </Heading>
              <Text mb={3}>
                OpenTelemetry is configured in <Code colorScheme="teal">src/instrumentation.ts</Code>:
              </Text>
              <Box p={4} bg="gray.900" color="white" borderRadius="md" fontFamily="mono" fontSize="sm" overflowX="auto" mb={4}>
                <pre>
{`import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Configure the SDK to export telemetry data to Coralogix
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://ingress.coralogix.in:443/v1/traces',
  headers: {
    'Authorization': \`Bearer \${process.env.CORALOGIX_PRIVATE_KEY || 'your-coralogix-private-key'}\`,
  },
});

// Initialize the SDK
export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME || 'cx-rum-backend',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.SERVICE_VERSION || '1.0.0',
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingPaths: ['/health', '/metrics'],
      },
      '@opentelemetry/instrumentation-express': { enabled: true },
    }),
  ],
});

// Start the SDK
try {
  otelSDK.start();
  console.log('OpenTelemetry instrumentation initialized');
} catch (error) {
  console.error('Error initializing OpenTelemetry instrumentation:', error);
}`}
                </pre>
              </Box>
              
              <Heading as="h4" size="md" mt={6} mb={3}>
                Trace Context Extraction
              </Heading>
              <Text mb={3}>
                The backend extracts the trace context from incoming requests:
              </Text>
              <Box p={4} bg="gray.900" color="white" borderRadius="md" fontFamily="mono" fontSize="sm" overflowX="auto">
                <pre>
{`// Middleware to log trace context
app.use((req, res, next) => {
  const traceParent = req.headers['traceparent'];
  console.log(\`Received request to \${req.method} \${req.url}\`);
  console.log(\`Headers: \${JSON.stringify(req.headers)}\`);
  console.log(\`Traceparent: \${traceParent}\`);
  next();
});`}
                </pre>
              </Box>
              
              <Alert status="info" mt={4} borderRadius="md">
                <AlertIcon />
                The <Code colorScheme="teal">traceparent</Code> header is automatically extracted by OpenTelemetry and used to continue the trace from the frontend.
              </Alert>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem borderWidth="1px" borderRadius="lg" mb={4} overflow="hidden">
            <h2>
              <AccordionButton bg={sectionBg} py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                  API Endpoints
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={4}>
                The backend provides the following API endpoints:
              </Text>
              
              <TableContainer>
                <Table variant="simple" mb={4}>
                  <Thead>
                    <Tr>
                      <Th>Endpoint</Th>
                      <Th>Method</Th>
                      <Th>Description</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td><Code>/api/products</Code></Td>
                      <Td>GET</Td>
                      <Td>Get all products</Td>
                    </Tr>
                    <Tr>
                      <Td><Code>/api/products/:id</Code></Td>
                      <Td>GET</Td>
                      <Td>Get a product by ID</Td>
                    </Tr>
                    <Tr>
                      <Td><Code>/api/users</Code></Td>
                      <Td>GET</Td>
                      <Td>Get all users</Td>
                    </Tr>
                    <Tr>
                      <Td><Code>/api/users/:id</Code></Td>
                      <Td>GET</Td>
                      <Td>Get a user by ID</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
              
              <Heading as="h4" size="md" mt={6} mb={3}>
                Data Sources
              </Heading>
              <Text mb={3}>
                The backend fetches data from JSONPlaceholder and transforms it:
              </Text>
              <Box p={4} bg="gray.900" color="white" borderRadius="md" fontFamily="mono" fontSize="sm" overflowX="auto">
                <pre>
{`// Function to fetch products from JSONPlaceholder and transform them
async function fetchProducts() {
  if (productsCache.length > 0) {
    return productsCache;
  }
  
  try {
    // Fetch posts from JSONPlaceholder and transform them into products
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=10');
    
    // Transform posts into products with prices and descriptions
    productsCache = response.data.map((post: any) => ({
      id: post.id,
      name: \`Product \${post.id}: \${post.title.substring(0, 20)}...\`,
      price: Number((post.id * 49.99).toFixed(2)),
      description: post.body
    }));
    
    return productsCache;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}`}
                </pre>
              </Box>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem borderWidth="1px" borderRadius="lg" mb={4} overflow="hidden">
            <h2>
              <AccordionButton bg={sectionBg} py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                  CORS Configuration
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={4}>
                The backend is configured to allow cross-origin requests from the frontend:
              </Text>
              
              <Box p={4} bg="gray.900" color="white" borderRadius="md" fontFamily="mono" fontSize="sm" overflowX="auto">
                <pre>
{`// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['traceparent']
}));`}
                </pre>
              </Box>
              
              <Alert status="warning" mt={4} borderRadius="md">
                <AlertIcon />
                The <Code colorScheme="teal">exposedHeaders</Code> option is crucial for trace context propagation, as it allows the frontend to access the <Code colorScheme="teal">traceparent</Code> header.
              </Alert>
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
                The backend uses the following environment variables:
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
                      <Td><Code>PORT</Code></Td>
                      <Td>Port to run the server on</Td>
                      <Td>3001</Td>
                    </Tr>
                    <Tr>
                      <Td><Code>OTEL_EXPORTER_OTLP_ENDPOINT</Code></Td>
                      <Td>OpenTelemetry exporter endpoint</Td>
                      <Td>https://ingress.coralogix.in:443/v1/traces</Td>
                    </Tr>
                    <Tr>
                      <Td><Code>CORALOGIX_PRIVATE_KEY</Code></Td>
                      <Td>Coralogix private key</Td>
                      <Td>-</Td>
                    </Tr>
                    <Tr>
                      <Td><Code>SERVICE_NAME</Code></Td>
                      <Td>Service name for OpenTelemetry</Td>
                      <Td>cx-rum-backend</Td>
                    </Tr>
                    <Tr>
                      <Td><Code>SERVICE_VERSION</Code></Td>
                      <Td>Service version</Td>
                      <Td>1.0.0</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
              
              <Text mb={3}>
                These variables should be defined in a <Code colorScheme="teal">.env</Code> file in the backend directory:
              </Text>
              <Box p={4} bg="gray.900" color="white" borderRadius="md" fontFamily="mono" fontSize="sm" overflowX="auto">
                <pre>
{`# Server Configuration
PORT=3001

# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingress.coralogix.in:443/v1/traces
CORALOGIX_PRIVATE_KEY=your-coralogix-private-key

# Service Information
SERVICE_NAME=cx-rum-backend
SERVICE_VERSION=1.0.0`}
                </pre>
              </Box>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem borderWidth="1px" borderRadius="lg" mb={4} overflow="hidden">
            <h2>
              <AccordionButton bg={sectionBg} py={4}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                  Running the Backend
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={4}>
                To run the backend application:
              </Text>
              
              <UnorderedList spacing={3} mb={4}>
                <ListItem>
                  <Text>
                    Install dependencies:
                    <Code colorScheme="teal" ml={2}>npm install</Code>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Start the development server (without OpenTelemetry):
                    <Code colorScheme="teal" ml={2}>npm run dev</Code>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Start the development server (with OpenTelemetry):
                    <Code colorScheme="teal" ml={2}>npm run dev:otel</Code>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Build for production:
                    <Code colorScheme="teal" ml={2}>npm run build</Code>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Start the production server:
                    <Code colorScheme="teal" ml={2}>npm run start</Code>
                  </Text>
                </ListItem>
              </UnorderedList>
              
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                The backend server should be running before starting the frontend application to ensure proper functionality.
              </Alert>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Container>
  );
}
