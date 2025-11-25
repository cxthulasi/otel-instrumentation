'use client';
import React, { useState } from 'react';
import { Button } from '@chakra-ui/react';

interface ReactErrorTriggerProps {
  shouldError?: boolean;
}

export function ReactErrorTrigger({ shouldError = false }: ReactErrorTriggerProps) {
  const [triggerError, setTriggerError] = useState(false);

  if (triggerError || shouldError) {
    // This will trigger the Error Boundary
    throw new Error('React Component Error: This error was triggered intentionally to test the Error Boundary');
  }

  return (
    <Button
      size="sm"
      colorScheme="red"
      variant="outline"
      onClick={() => setTriggerError(true)}
    >
      Trigger React Error
    </Button>
  );
}
