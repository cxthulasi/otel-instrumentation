'use client';

import {
  Box,
  Button,
  Flex,
  Icon,
  Link,
  Text,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaGithub, FaStar, FaCodeBranch } from 'react-icons/fa';
import { trackCustomEvent } from '@/lib/coralogix';

// Animation for the star icon
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

interface GitHubRepoLinkProps {
  variant?: 'full' | 'compact';
  showStats?: boolean;
}

export function GitHubRepoLink({ variant = 'full', showStats = true }: GitHubRepoLinkProps) {
  // GitHub repository URL (placeholder for now)
  const repoUrl = 'https://github.com/cxthulasi/cx-rum-frontend-ts/login';

  // Colors based on theme
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('brand.500', 'brand.300');

  // Animation
  const pulseAnimation = `${pulse} 2s infinite`;

  const handleRepoClick = () => {
    trackCustomEvent('github_repo_click', { variant });
  };

  // Compact variant (just a button)
  if (variant === 'compact') {
    return (
      <Tooltip label="View source code on GitHub" placement="top">
        <Button
          as={Link}
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          leftIcon={<Icon as={FaGithub} boxSize={5} />}
          colorScheme="gray"
          variant="outline"
          size="md"
          onClick={handleRepoClick}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'md',
            textDecoration: 'none',
          }}
          transition="all 0.3s"
        >
          View on GitHub
        </Button>
      </Tooltip>
    );
  }

  // Full variant (card-like)
  return (
    <Link
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      _hover={{ textDecoration: 'none' }}
      onClick={handleRepoClick}
    >
      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        transition="all 0.3s"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: 'lg',
          borderColor: accentColor,
        }}
        maxW="100%"
        w={{ base: 'full', md: '450px' }}
      >
        <Flex p={5} align="center">
          <Icon as={FaGithub} boxSize={10} color={textColor} mr={4} />
          <Box flex="1">
            <Text fontWeight="bold" fontSize="lg" mb={1}>
              Coralogix RUM Demo
            </Text>
            <Text fontSize="sm" color="gray.500" noOfLines={2}>
              Next.js frontend with Coralogix RUM and Node.js backend with OpenTelemetry
            </Text>
          </Box>
        </Flex>

        {showStats && (
          <Flex
            bg={hoverBgColor}
            p={3}
            justify="space-between"
            borderTopWidth="1px"
            borderColor={borderColor}
          >
            <Flex align="center">
              <Icon
                as={FaStar}
                color="yellow.400"
                mr={1}
                sx={{ animation: pulseAnimation }}
              />
              <Text fontSize="sm" fontWeight="medium">
                Star this repo
              </Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaCodeBranch} color={accentColor} mr={1} />
              <Text fontSize="sm" fontWeight="medium">
                Fork & Contribute
              </Text>
            </Flex>
          </Flex>
        )}
      </Box>
    </Link>
  );
}
