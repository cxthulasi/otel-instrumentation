'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useColorModeValue,
  Skeleton,
  Stack,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { fetchUsers } from '@/lib/api';
import { trackCustomEvent } from '@/lib/coralogix';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorSimulator } from '@/components/ErrorSimulator';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    trackCustomEvent('page_view', { page: 'users' });
    
    const getUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
        trackCustomEvent('api_error', { 
          page: 'users', 
          endpoint: '/api/users',
          error: err instanceof Error ? err.message : String(err)
        });
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  const handleUserClick = (userId: number) => {
    trackCustomEvent('user_click', { userId });
    router.push(`/users/${userId}`);
  };

  return (
    <ErrorBoundary>
      <Container maxW={'7xl'} py={12}>
        <Heading as="h1" mb={8}>
          Users
        </Heading>

        {/* Error Simulator for testing Coralogix integration */}
        <Box mb={6}>
          <ErrorSimulator compact />
        </Box>

        {error && (
          <Box p={4} bg="red.100" color="red.800" borderRadius="md" mb={6}>
            <Text>{error}</Text>
          </Box>
        )}

      {loading ? (
        <Stack spacing={4}>
          <Skeleton height="40px" />
          <Skeleton height="40px" />
          <Skeleton height="40px" />
          <Skeleton height="40px" />
          <Skeleton height="40px" />
        </Stack>
      ) : (
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="lg"
          boxShadow="lg"
          overflow="hidden"
        >
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
              <Tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id} _hover={{ bg: 'gray.50' }}>
                  <Td>{user.id}</Td>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleUserClick(user.id)}
                    >
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Container>
    </ErrorBoundary>
  );
}
