"use client";

import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { trackCustomEvent } from '@/lib/coralogix';

export function Footer() {
  const handleFooterClick = (linkName: string) => {
    trackCustomEvent('footer_click', { linkName });
  };

  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      borderTopWidth={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Container
        as={Stack}
        maxW={'6xl'}
        py={4}
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        justify={{ base: 'center', md: 'space-between' }}
        align={{ base: 'center', md: 'center' }}
      >
        <Text>© 2023 Coralogix RUM Demo. All rights reserved</Text>
        <Stack direction={'row'} spacing={6}>
          <Link
            href={'#'}
            isExternal
            onClick={() => handleFooterClick('twitter')}
          >
            <FaTwitter />
          </Link>
          <Link
            href={'#'}
            isExternal
            onClick={() => handleFooterClick('github')}
          >
            <FaGithub />
          </Link>
          <Link
            href={'#'}
            isExternal
            onClick={() => handleFooterClick('linkedin')}
          >
            <FaLinkedin />
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
