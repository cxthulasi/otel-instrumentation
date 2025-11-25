'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { captureCustomError } from '@/lib/coralogix';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Capture the error with Coralogix
    captureCustomError(error, {
      errorType: 'react_error_boundary',
      timestamp: new Date().toISOString(),
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box p={8} textAlign="center">
          <VStack spacing={4}>
            <Heading as="h2" size="lg" color="red.500">
              Something went wrong
            </Heading>
            <Text color="gray.600">
              An error occurred in this component. The error has been logged for investigation.
            </Text>
            {this.state.error && (
              <Box p={4} bg="red.50" borderRadius="md" maxW="md">
                <Text fontSize="sm" color="red.700" fontFamily="mono">
                  {this.state.error.message}
                </Text>
              </Box>
            )}
            <Button colorScheme="blue" onClick={this.handleReset}>
              Try Again
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
