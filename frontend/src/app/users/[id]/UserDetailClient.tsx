// app/users/[id]/UserDetailClient.tsx (Client Component)
'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Avatar,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  Skeleton,
  SkeletonCircle,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { fetchUser } from '@/lib/api';
import { trackCustomEvent } from '@/lib/coralogix';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function UserDetailClient({ id }: { id: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = parseInt(id);
  const router = useRouter();

  useEffect(() => {
    trackCustomEvent('page_view', { page: 'user_detail', userId });
    
    const getUser = async () => {
      try {
        setLoading(true);
        const data = await fetchUser(userId);
        setUser(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user details. Please try again later.');
        trackCustomEvent('api_error', { 
          page: 'user_detail', 
          endpoint: `/api/users/${userId}`,
          error: err instanceof Error ? err.message : String(err)
        });
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [userId]);

  const handleBackClick = () => {
    trackCustomEvent('navigation_click', { action: 'back_to_users' });
    router.push('/users');
  };

  if (loading) {
    return (
      <Container maxW={'7xl'} py={12}>
        <Stack spacing={8}>
          <Skeleton height="40px" width="50%" />
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            boxShadow={'lg'}
            p={8}
            rounded={'lg'}
          >
            <Stack direction={{ base: 'column', md: 'row' }} spacing={8}>
              <SkeletonCircle size="100px" />
              <Stack flex={1} spacing={5}>
                <Skeleton height="30px" width="60%" />
                <Skeleton height="20px" width="40%" />
                <Skeleton height="100px" />
              </Stack>
            </Stack>
          </Box>
          <Skeleton height="200px" />
          <Skeleton height="50px" width="100px" />
        </Stack>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxW={'7xl'} py={12}>
        <Box p={4} bg="red.100" color="red.800" borderRadius="md">
          <Text>{error || 'User not found'}</Text>
        </Box>
        <Button mt={4} onClick={handleBackClick}>
          Back to Users
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW={'7xl'} py={12}>
      <Heading as="h1" mb={8}>
        User Profile
      </Heading>

      <Box
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow={'lg'}
        p={8}
        rounded={'lg'}
        mb={8}
      >
        <Stack direction={{ base: 'column', md: 'row' }} spacing={8}>
          <Avatar
            size={'xl'}
            src={`https://avatars.dicebear.com/api/initials/${user.name.replace(/\s+/g, '-')}.svg`}
            name={user.name}
            bg="brand.500"
            mb={{ base: 4, md: 0 }}
          />
          <Stack flex={1} spacing={5}>
            <Heading fontSize={'2xl'} fontWeight={500} fontFamily={'body'}>
              {user.name}
            </Heading>
            <Text color={'gray.500'}>{user.email}</Text>
            <Text color={'gray.500'}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </Text>
          </Stack>
        </Stack>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={8}>
        <Stat
          px={{ base: 4, md: 8 }}
          py={'5'}
          shadow={'xl'}
          border={'1px solid'}
          borderColor={useColorModeValue('gray.200', 'gray.500')}
          rounded={'lg'}
        >
          <StatLabel fontWeight={'medium'}>Orders</StatLabel>
          <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
            12
          </StatNumber>
          <StatHelpText>Last 30 days</StatHelpText>
        </Stat>
        <Stat
          px={{ base: 4, md: 8 }}
          py={'5'}
          shadow={'xl'}
          border={'1px solid'}
          borderColor={useColorModeValue('gray.200', 'gray.500')}
          rounded={'lg'}
        >
          <StatLabel fontWeight={'medium'}>Spent</StatLabel>
          <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
            $1,245.89
          </StatNumber>
          <StatHelpText>Total amount</StatHelpText>
        </Stat>
        <Stat
          px={{ base: 4, md: 8 }}
          py={'5'}
          shadow={'xl'}
          border={'1px solid'}
          borderColor={useColorModeValue('gray.200', 'gray.500')}
          rounded={'lg'}
        >
          <StatLabel fontWeight={'medium'}>Last Activity</StatLabel>
          <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
            2 days ago
          </StatNumber>
          <StatHelpText>Updated daily</StatHelpText>
        </Stat>
      </SimpleGrid>

      <Button colorScheme="blue" onClick={handleBackClick}>
        Back to Users
      </Button>
    </Container>
  );
}
