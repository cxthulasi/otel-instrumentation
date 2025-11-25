'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Badge,
  useColorModeValue,
  Button,
  Skeleton,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/lib/api';
import { trackCustomEvent } from '@/lib/coralogix';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorSimulator } from '@/components/ErrorSimulator';


interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    trackCustomEvent('page_view', { page: 'products' });

    const getProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        trackCustomEvent('api_error', {
          page: 'products',
          endpoint: '/api/products',
          error: err instanceof Error ? err.message : String(err)
        });
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  const handleProductClick = (productId: number) => {
    trackCustomEvent('product_click', { productId });
    router.push(`/products/${productId}`);
  };

  return (
    <ErrorBoundary>
      <Container maxW={'7xl'} py={12}>
        <Heading as="h1" mb={8}>
          Products
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
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {[...Array(6)].map((_, i) => (
            <Box key={i} height="250px">
              <Skeleton height="100%" />
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </SimpleGrid>
      )}
    </Container>
    </ErrorBoundary>
  );
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Box
      maxW={'445px'}
      w={'full'}
      bg={useColorModeValue('white', 'gray.900')}
      boxShadow={'2xl'}
      rounded={'md'}
      p={6}
      overflow={'hidden'}
      cursor="pointer"
      onClick={onClick}
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.02)' }}
    >
      <Stack>
        <Text
          color={'brand.500'}
          textTransform={'uppercase'}
          fontWeight={800}
          fontSize={'sm'}
          letterSpacing={1.1}
        >
          Product
        </Text>
        <Heading
          color={useColorModeValue('gray.700', 'white')}
          fontSize={'2xl'}
          fontFamily={'body'}
        >
          {product.name}
        </Heading>
        <Text color={'gray.500'}>{product.description}</Text>
      </Stack>
      <Stack mt={6} direction={'row'} spacing={4} align={'center'}>
        <Stack direction={'column'} spacing={0} fontSize={'sm'}>
          <Text fontWeight={600}>${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</Text>
          <Text color={'gray.500'}>In Stock</Text>
        </Stack>
        <Badge colorScheme="green" ml="auto">
          New
        </Badge>
      </Stack>
      <Button
        mt={4}
        w={'full'}
        bg={'brand.500'}
        color={'white'}
        rounded={'md'}
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
          bg: 'brand.600',
        }}
      >
        View Details
      </Button>
    </Box>
  );
}
