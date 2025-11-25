'use client';

import { useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  VStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { FaChartLine, FaCode, FaNetworkWired } from 'react-icons/fa';
import { trackCustomEvent } from '@/lib/coralogix';
import { GitHubRepoLink } from '@/components/GitHubRepoLink';

export default function AboutPage() {
  useEffect(() => {
    trackCustomEvent('page_view', { page: 'about' });
  }, []);

  return (
    <Container maxW={'7xl'} py={12}>
      <VStack spacing={8} as={Box} textAlign={'center'} mb={12}>
        <Heading
          fontWeight={600}
          fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
          lineHeight={'110%'}
        >
          About This Demo
        </Heading>
        <Text color={'gray.500'} maxW={'3xl'}>
          This application demonstrates the integration of Coralogix Browser RUM SDK
          on the frontend and OpenTelemetry instrumentation on the backend.
          It shows how to implement distributed tracing across the full stack.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
        <Feature
          icon={<Icon as={FaChartLine} w={10} h={10} />}
          title={'Frontend Monitoring'}
          text={
            'The frontend is instrumented with Coralogix Browser RUM SDK to track user interactions, page loads, API calls, and errors. This provides visibility into the user experience.'
          }
        />
        <Feature
          icon={<Icon as={FaNetworkWired} w={10} h={10} />}
          title={'Distributed Tracing'}
          text={
            'Trace context is propagated from the frontend to the backend, enabling end-to-end visibility of user requests across the entire application stack.'
          }
        />
        <Feature
          icon={<Icon as={FaCode} w={10} h={10} />}
          title={'Backend Instrumentation'}
          text={
            'The backend is auto-instrumented with OpenTelemetry to capture API calls, database queries, and other backend operations. This provides detailed insights into backend performance.'
          }
        />
      </SimpleGrid>

      <Box mt={20}>
        <Heading as="h2" size="xl" mb={6}>
          How It Works
        </Heading>
        <Stack spacing={4}>
          <Text>
            <strong>1. Frontend Instrumentation:</strong> The Next.js frontend is instrumented with the Coralogix Browser RUM SDK, which automatically captures user interactions, page loads, API calls, and errors.
          </Text>
          <Text>
            <strong>2. Trace Context Propagation:</strong> When the frontend makes API calls to the backend, the Coralogix SDK automatically adds trace context headers to the requests.
          </Text>
          <Text>
            <strong>3. Backend Instrumentation:</strong> The Node.js backend is auto-instrumented with OpenTelemetry, which captures API calls, database queries, and other backend operations.
          </Text>
          <Text>
            <strong>4. Trace Context Extraction:</strong> The backend extracts the trace context from the incoming requests and continues the trace, enabling end-to-end visibility.
          </Text>
          <Text>
            <strong>5. Telemetry Export:</strong> Both frontend and backend telemetry data is exported to Coralogix, where it can be visualized and analyzed.
          </Text>
        </Stack>
      </Box>

      <Box mt={20} bg={useColorModeValue('gray.50', 'gray.900')} p={8} borderRadius="lg">
        <Heading as="h2" size="xl" mb={6}>
          Technologies Used
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <VStack align="start" spacing={4}>
            <Heading as="h3" size="md">
              Frontend
            </Heading>
            <Text>• Next.js with TypeScript</Text>
            <Text>• Chakra UI for styling</Text>
            <Text>• Coralogix Browser RUM SDK</Text>
            <Text>• Axios for API calls</Text>
          </VStack>
          <VStack align="start" spacing={4}>
            <Heading as="h3" size="md">
              Backend
            </Heading>
            <Text>• Node.js with TypeScript</Text>
            <Text>• Express.js for API endpoints</Text>
            <Text>• OpenTelemetry for instrumentation</Text>
            <Text>• OTLP exporter for Coralogix</Text>
          </VStack>
        </SimpleGrid>
      </Box>

      {/* GitHub Repository Section */}
      <Box mt={20} textAlign="center">
        <Heading as="h2" size="xl" mb={4}>
          Source Code
        </Heading>
        <Text color="gray.500" maxW="3xl" mx="auto" mb={8}>
          Explore the source code, contribute, or use this project as a reference for your own implementation.
        </Text>
        <Flex justify="center" mb={8}>
          <GitHubRepoLink variant="full" showStats={true} />
        </Flex>
        <Divider my={10} />
        <Text fontSize="sm" color="gray.500">
          This project is open source and available under the MIT License.
        </Text>
      </Box>
    </Container>
  );
}

interface FeatureProps {
  title: string;
  text: string;
  icon: React.ReactElement;
}

function Feature({ title, text, icon }: FeatureProps) {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      boxShadow={'lg'}
      p={8}
      rounded={'lg'}
      align={'center'}
      pos={'relative'}
      _after={{
        content: '""',
        w: 0,
        h: 0,
        borderLeft: 'solid transparent',
        borderLeftWidth: 16,
        borderRight: 'solid transparent',
        borderRightWidth: 16,
        borderTop: 'solid',
        borderTopWidth: 16,
        borderTopColor: useColorModeValue('white', 'gray.800'),
        pos: 'absolute',
        bottom: '-16px',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <Box
        color={'brand.500'}
        rounded={'full'}
        bg={useColorModeValue('brand.50', 'gray.700')}
        p={3}
        mb={5}
      >
        {icon}
      </Box>
      <Heading as={'h3'} fontSize={'xl'} mb={3}>
        {title}
      </Heading>
      <Text color={'gray.500'} fontSize={'sm'}>
        {text}
      </Text>
    </Stack>
  );
}
