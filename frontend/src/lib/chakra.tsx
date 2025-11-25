"use client";

import { ChakraProvider } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { extendTheme } from '@chakra-ui/theme-utils';

// Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9dff',
      500: '#0080ff',
      600: '#0066cc',
      700: '#004d99',
      800: '#003366',
      900: '#001a33',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
});

interface ChakraProps {
  children: ReactNode;
}

export function Chakra({ children }: ChakraProps) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
