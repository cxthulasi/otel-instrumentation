// app/products/[id]/ProductDetailClient.tsx (Client Component)
'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Stack,
  Text,
  Flex,
  VStack,
  Button,
  Heading,
  SimpleGrid,
  StackDivider,
  useColorModeValue,
  List,
  ListItem,
  Skeleton,
} from '@chakra-ui/react';
import { MdLocalShipping } from 'react-icons/md';
import { fetchProduct } from '@/lib/api';
import { trackCustomEvent } from '@/lib/coralogix';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default function ProductDetailClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productId = parseInt(id);

  useEffect(() => {
    trackCustomEvent('page_view', { page: 'product_detail', productId });

    const getProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProduct(productId);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
        trackCustomEvent('api_error', {
          page: 'product_detail',
          endpoint: `/api/products/${productId}`,
          error: err instanceof Error ? err.message : String(err)
        });
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [productId]);

  const handleAddToCart = () => {
    trackCustomEvent('add_to_cart', { productId, productName: product?.name });
  };

  if (loading) {
    return (
      <Container maxW={'7xl'}>
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={{ base: 8, md: 10 }}
          py={{ base: 18, md: 24 }}
        >
          <Skeleton height="400px" />
          <Stack spacing={{ base: 6, md: 10 }}>
            <Skeleton height="40px" width="70%" />
            <Skeleton height="30px" width="40%" />
            <Skeleton height="200px" />
            <Skeleton height="50px" />
          </Stack>
        </SimpleGrid>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxW={'7xl'} py={12}>
        <Box p={4} bg="red.100" color="red.800" borderRadius="md">
          <Text>{error || 'Product not found'}</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW={'7xl'}>
      <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 18, md: 24 }}
      >
        <Flex>
          <Box
            rounded={'md'}
            bg={'gray.100'}
            w={'100%'}
            h={{ base: '100%', sm: '400px', lg: '500px' }}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            aria-label={'product image'}
          >
            <Text fontSize="xl" color="gray.500">
              Product Image
            </Text>
          </Box>
        </Flex>
        <Stack spacing={{ base: 6, md: 10 }}>
          <Box as={'header'}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: '2xl', sm: '4xl', lg: '5xl' }}
            >
              {product.name}
            </Heading>
            <Text
              color={useColorModeValue('gray.900', 'gray.400')}
              fontWeight={300}
              fontSize={'2xl'}
            >
              ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
            </Text>
          </Box>

          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={'column'}
            divider={
              <StackDivider
                borderColor={useColorModeValue('gray.200', 'gray.600')}
              />
            }
          >
            <VStack spacing={{ base: 4, sm: 6 }}>
              <Text fontSize={'lg'}>{product.description}</Text>
              <Text fontSize={'lg'}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua.
              </Text>
            </VStack>
            <Box>
              <Text
                fontSize={{ base: '16px', lg: '18px' }}
                color={useColorModeValue('brand.500', 'brand.300')}
                fontWeight={'500'}
                textTransform={'uppercase'}
                mb={'4'}
              >
                Product Details
              </Text>

              <List spacing={2}>
                <ListItem>
                  <Text as={'span'} fontWeight={'bold'}>
                    Product ID:
                  </Text>{' '}
                  {product.id}
                </ListItem>
                <ListItem>
                  <Text as={'span'} fontWeight={'bold'}>
                    Category:
                  </Text>{' '}
                  Electronics
                </ListItem>
                <ListItem>
                  <Text as={'span'} fontWeight={'bold'}>
                    Availability:
                  </Text>{' '}
                  In Stock
                </ListItem>
                <ListItem>
                  <Text as={'span'} fontWeight={'bold'}>
                    Shipping:
                  </Text>{' '}
                  Free shipping
                </ListItem>
              </List>
            </Box>
          </Stack>

          <Button
            rounded={'none'}
            w={'full'}
            mt={8}
            size={'lg'}
            py={'7'}
            bg={useColorModeValue('brand.500', 'brand.50')}
            color={useColorModeValue('white', 'gray.900')}
            textTransform={'uppercase'}
            _hover={{
              transform: 'translateY(2px)',
              boxShadow: 'lg',
              bg: 'brand.600',
            }}
            onClick={handleAddToCart}
          >
            Add to cart
          </Button>

          <Stack direction="row" alignItems="center" justifyContent={'center'}>
            <MdLocalShipping />
            <Text>2-3 business days delivery</Text>
          </Stack>
        </Stack>
      </SimpleGrid>
    </Container>
  );
}
