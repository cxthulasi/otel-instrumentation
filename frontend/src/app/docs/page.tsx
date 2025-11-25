'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Button,
  Icon,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FiServer, FiMonitor, FiBook, FiArrowRight } from 'react-icons/fi';
import { trackCustomEvent } from '@/lib/coralogix';

export default function DocsPage() {
  const router = useRouter();
  
  useEffect(() => {
    trackCustomEvent('page_view', { page: 'docs_index' });
  }, []);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const handleNavigation = (path: string) => {
    trackCustomEvent('docs_navigation', { path });
    router.push(path);
  };

  return (
    <Container maxW="container.xl" py={16}>
      <VStack spacing={12} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={4}>
            Documentation
          </Heading>
          <Text fontSize="xl" color="gray.500" maxW="3xl" mx="auto">
            Comprehensive guides for the frontend and backend components of the Coralogix RUM and OpenTelemetry demo application
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          {/* Frontend Documentation Card */}
          <Box
            p={8}
            borderRadius="lg"
            bg={bgColor}
            boxShadow="md"
            borderWidth="1px"
            borderColor={borderColor}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg', bg: hoverBg }}
            onClick={() => handleNavigation('/docs/frontend')}
            cursor="pointer"
          >
            <Flex direction="column" height="100%">
              <Flex align="center" mb={6}>
                <Icon as={FiMonitor} boxSize={10} color="blue.500" mr={4} />
                <Heading as="h2" size="lg">
                  Frontend Documentation
                </Heading>
              </Flex>
              
              <Text fontSize="md" color="gray.500" mb={6} flex="1">
                Learn about the Next.js frontend application with Coralogix RUM instrumentation, including project structure, API integration, and trace context propagation.
              </Text>
              
              <Button 
                rightIcon={<FiArrowRight />} 
                colorScheme="blue" 
                variant="outline"
                alignSelf="flex-start"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigation('/docs/frontend');
                }}
              >
                View Documentation
              </Button>
            </Flex>
          </Box>

          {/* Backend Documentation Card */}
          <Box
            p={8}
            borderRadius="lg"
            bg={bgColor}
            boxShadow="md"
            borderWidth="1px"
            borderColor={borderColor}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg', bg: hoverBg }}
            onClick={() => handleNavigation('/docs/backend')}
            cursor="pointer"
          >
            <Flex direction="column" height="100%">
              <Flex align="center" mb={6}>
                <Icon as={FiServer} boxSize={10} color="teal.500" mr={4} />
                <Heading as="h2" size="lg">
                  Backend Documentation
                </Heading>
              </Flex>
              
              <Text fontSize="md" color="gray.500" mb={6} flex="1">
                Explore the Node.js backend with OpenTelemetry instrumentation, including API endpoints, data sources, and trace context extraction.
              </Text>
              
              <Button 
                rightIcon={<FiArrowRight />} 
                colorScheme="teal" 
                variant="outline"
                alignSelf="flex-start"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigation('/docs/backend');
                }}
              >
                View Documentation
              </Button>
            </Flex>
          </Box>
        </SimpleGrid>

        {/* Additional Resources */}
        <Box
          p={8}
          borderRadius="lg"
          bg={bgColor}
          boxShadow="md"
          borderWidth="1px"
          borderColor={borderColor}
          mt={8}
        >
          <Flex align="center" mb={6}>
            <Icon as={FiBook} boxSize={8} color="purple.500" mr={4} />
            <Heading as="h2" size="lg">
              Additional Resources
            </Heading>
          </Flex>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Box>
              <Heading as="h3" size="md" mb={3} color="purple.500">
                Coralogix RUM
              </Heading>
              <Text mb={3}>
                Learn more about Coralogix Real User Monitoring and how to instrument your web applications.
              </Text>
              <Button 
                as="a" 
                href="https://coralogix.com/docs/real-user-monitoring/" 
                target="_blank"
                colorScheme="purple" 
                size="sm"
                onClick={() => trackCustomEvent('external_link', { destination: 'coralogix_rum_docs' })}
              >
                Visit Documentation
              </Button>
            </Box>
            
            <Box>
              <Heading as="h3" size="md" mb={3} color="orange.500">
                OpenTelemetry
              </Heading>
              <Text mb={3}>
                Explore OpenTelemetry, an observability framework for cloud-native software.
              </Text>
              <Button 
                as="a" 
                href="https://opentelemetry.io/docs/" 
                target="_blank"
                colorScheme="orange" 
                size="sm"
                onClick={() => trackCustomEvent('external_link', { destination: 'opentelemetry_docs' })}
              >
                Visit Documentation
              </Button>
            </Box>
            
            <Box>
              <Heading as="h3" size="md" mb={3} color="blue.500">
                Distributed Tracing
              </Heading>
              <Text mb={3}>
                Understand distributed tracing concepts and how to implement them in your applications.
              </Text>
              <Button 
                as="a" 
                href="https://coralogix.com/docs/user-guides/monitoring-and-insights/distributed-tracing/distributed-tracing/" 
                target="_blank"
                colorScheme="blue" 
                size="sm"
                onClick={() => trackCustomEvent('external_link', { destination: 'distributed_tracing_docs' })}
              >
                Learn More
              </Button>
            </Box>
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  );
}
