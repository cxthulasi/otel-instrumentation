'use client';
import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Collapse,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Tooltip,
} from '@chakra-ui/react';
import {
  simulateJavaScriptError,
  simulateAsyncError,
  simulateNetworkError,
  simulateValidationError,
  simulateTypeError,
  simulateReferenceError,
  simulatePromiseRejection,
  simulateDeepStackError,
  logCustomError,
  logCustomWarning,
  trackCustomEvent,
} from '@/lib/coralogix';
import { ReactErrorTrigger } from './ReactErrorTrigger';

interface ErrorSimulatorProps {
  compact?: boolean;
}

export function ErrorSimulator({ compact = false }: ErrorSimulatorProps) {
  const { isOpen, onToggle } = useDisclosure();
  const [lastError, setLastError] = useState<string | null>(null);

  const handleJavaScriptError = () => {
    try {
      setLastError('JavaScript Error');
      simulateJavaScriptError();
    } catch (error) {
      console.log('JavaScript error simulated and caught');
    }
  };

  const handleAsyncError = () => {
    setLastError('Async Error (check console in 1 second)');
    simulateAsyncError();
  };

  const handleNetworkError = () => {
    setLastError('Network Error');
    simulateNetworkError();
  };

  const handleValidationError = () => {
    setLastError('Validation Error');
    simulateValidationError();
  };

  const handleTypeError = () => {
    try {
      setLastError('TypeError (with real stack trace)');
      simulateTypeError();
    } catch (error) {
      console.log('TypeError simulated and caught');
    }
  };

  const handleReferenceError = () => {
    try {
      setLastError('ReferenceError (with real stack trace)');
      simulateReferenceError();
    } catch (error) {
      console.log('ReferenceError simulated and caught');
    }
  };

  const handlePromiseRejection = () => {
    setLastError('Promise Rejection (unhandled)');
    simulatePromiseRejection();
  };

  const handleDeepStackError = () => {
    try {
      setLastError('Deep Stack Error (nested calls)');
      simulateDeepStackError();
    } catch (error) {
      console.log('Deep stack error simulated and caught');
    }
  };

  const handleCustomLog = () => {
    setLastError('Custom Error Log');
    logCustomError('Custom error message for testing', {
      customField: 'test_value',
      timestamp: new Date().toISOString(),
      source: 'error_simulator'
    });
  };

  const handleCustomWarning = () => {
    setLastError('Custom Warning Log');
    logCustomWarning('Custom warning message for testing', {
      warningType: 'test_warning',
      timestamp: new Date().toISOString(),
      source: 'error_simulator'
    });
  };

  const handleCustomEvent = () => {
    setLastError('Custom Event Tracked');
    trackCustomEvent('error_simulator_used', {
      action: 'custom_event_test',
      timestamp: new Date().toISOString(),
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    });
  };

  if (compact) {
    return (
      <Box>
        <Button size="sm" colorScheme="orange" onClick={onToggle} mb={2}>
          {isOpen ? 'Hide' : 'Show'} Error Simulator
        </Button>
        <Collapse in={isOpen} animateOpacity>
          <ErrorSimulatorContent
            lastError={lastError}
            onJavaScriptError={handleJavaScriptError}
            onAsyncError={handleAsyncError}
            onNetworkError={handleNetworkError}
            onValidationError={handleValidationError}
            onTypeError={handleTypeError}
            onReferenceError={handleReferenceError}
            onPromiseRejection={handlePromiseRejection}
            onDeepStackError={handleDeepStackError}
            onCustomLog={handleCustomLog}
            onCustomWarning={handleCustomWarning}
            onCustomEvent={handleCustomEvent}
          />
        </Collapse>
      </Box>
    );
  }

  return (
    <ErrorSimulatorContent
      lastError={lastError}
      onJavaScriptError={handleJavaScriptError}
      onAsyncError={handleAsyncError}
      onNetworkError={handleNetworkError}
      onValidationError={handleValidationError}
      onTypeError={handleTypeError}
      onReferenceError={handleReferenceError}
      onPromiseRejection={handlePromiseRejection}
      onDeepStackError={handleDeepStackError}
      onCustomLog={handleCustomLog}
      onCustomWarning={handleCustomWarning}
      onCustomEvent={handleCustomEvent}
    />
  );
}

interface ErrorSimulatorContentProps {
  lastError: string | null;
  onJavaScriptError: () => void;
  onAsyncError: () => void;
  onNetworkError: () => void;
  onValidationError: () => void;
  onTypeError: () => void;
  onReferenceError: () => void;
  onPromiseRejection: () => void;
  onDeepStackError: () => void;
  onCustomLog: () => void;
  onCustomWarning: () => void;
  onCustomEvent: () => void;
}

function ErrorSimulatorContent({
  lastError,
  onJavaScriptError,
  onAsyncError,
  onNetworkError,
  onValidationError,
  onTypeError,
  onReferenceError,
  onPromiseRejection,
  onDeepStackError,
  onCustomLog,
  onCustomWarning,
  onCustomEvent,
}: ErrorSimulatorContentProps) {
  return (
    <Box p={4} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold" color="orange.800">
            🧪 Error Simulator for Coralogix
          </Text>
          <Badge colorScheme="orange" variant="subtle">
            Testing Tool
          </Badge>
        </HStack>

        {lastError && (
          <Alert status="info" size="sm">
            <AlertIcon />
            <AlertTitle fontSize="sm">Last Action:</AlertTitle>
            <AlertDescription fontSize="sm">{lastError}</AlertDescription>
          </Alert>
        )}

        <Divider />

        <VStack spacing={3} align="stretch">
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Error Types:
          </Text>
          
          <HStack wrap="wrap" spacing={2}>
            <Tooltip label="Throws a JavaScript error with stack trace">
              <Button size="sm" colorScheme="red" onClick={onJavaScriptError}>
                JS Error
              </Button>
            </Tooltip>
            
            <Tooltip label="Simulates an async error (setTimeout)">
              <Button size="sm" colorScheme="red" onClick={onAsyncError}>
                Async Error
              </Button>
            </Tooltip>
            
            <Tooltip label="Simulates a network/API error">
              <Button size="sm" colorScheme="red" onClick={onNetworkError}>
                Network Error
              </Button>
            </Tooltip>
            
            <Tooltip label="Simulates a validation error">
              <Button size="sm" colorScheme="red" onClick={onValidationError}>
                Validation Error
              </Button>
            </Tooltip>

            <Tooltip label="Triggers a React component error (caught by Error Boundary)">
              <ReactErrorTrigger />
            </Tooltip>
          </HStack>

          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mt={2}>
            Real Stack Trace Errors:
          </Text>

          <HStack wrap="wrap" spacing={2}>
            <Tooltip label="Generates a real TypeError with actual stack trace">
              <Button size="sm" colorScheme="purple" onClick={onTypeError}>
                TypeError
              </Button>
            </Tooltip>

            <Tooltip label="Generates a real ReferenceError with actual stack trace">
              <Button size="sm" colorScheme="purple" onClick={onReferenceError}>
                ReferenceError
              </Button>
            </Tooltip>

            <Tooltip label="Creates an unhandled promise rejection">
              <Button size="sm" colorScheme="purple" onClick={onPromiseRejection}>
                Promise Rejection
              </Button>
            </Tooltip>

            <Tooltip label="Creates error with deep call stack (4 levels)">
              <Button size="sm" colorScheme="purple" onClick={onDeepStackError}>
                Deep Stack
              </Button>
            </Tooltip>
          </HStack>

          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mt={2}>
            Custom Logs:
          </Text>
          
          <HStack wrap="wrap" spacing={2}>
            <Tooltip label="Logs a custom error message">
              <Button size="sm" colorScheme="orange" onClick={onCustomLog}>
                Custom Error
              </Button>
            </Tooltip>
            
            <Tooltip label="Logs a custom warning message">
              <Button size="sm" colorScheme="yellow" onClick={onCustomWarning}>
                Custom Warning
              </Button>
            </Tooltip>
            
            <Tooltip label="Tracks a custom event">
              <Button size="sm" colorScheme="blue" onClick={onCustomEvent}>
                Custom Event
              </Button>
            </Tooltip>
          </HStack>
        </VStack>

        <Text fontSize="xs" color="gray.600" mt={2}>
          💡 All errors and events are sent to Coralogix for visualization and analysis.
        </Text>
      </VStack>
    </Box>
  );
}
