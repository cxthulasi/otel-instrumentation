import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['traceparent']
}));
app.use(express.json());

// Middleware to log trace context
app.use((req, res, next) => {
  const traceParent = req.headers['traceparent'];
  console.log(`Received request to ${req.method} ${req.url}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  console.log(`Traceparent: ${traceParent}`);
  next();
});

// We'll fetch data from JSONPlaceholder

// Cache for products and users to avoid repeated API calls
let productsCache: any[] = [];
let usersCache: any[] = [];

// Function to fetch products from JSONPlaceholder and transform them
async function fetchProducts() {
  if (productsCache.length > 0) {
    return productsCache;
  }

  try {
    // Fetch posts from JSONPlaceholder and transform them into products
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=10');

    // Transform posts into products with prices and descriptions
    productsCache = response.data.map((post: any) => ({
      id: post.id,
      name: `Product ${post.id}: ${post.title.substring(0, 20)}...`,
      price: Number((post.id * 49.99).toFixed(2)),
      description: post.body
    }));

    return productsCache;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Function to fetch users from JSONPlaceholder
async function fetchUsers() {
  if (usersCache.length > 0) {
    return usersCache;
  }

  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/users');
    usersCache = response.data;
    return usersCache;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await fetchProducts();

    // Simulate some delay
    setTimeout(() => {
      res.json(products);
    }, 200);
  } catch (error) {
    console.error('Error in /api/products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const products = await fetchProducts();
    const id = parseInt(req.params.id);
    const product = products.find((p: any) => p.id === id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Simulate some delay
    setTimeout(() => {
      res.json(product);
    }, 150);
  } catch (error) {
    console.error('Error in /api/products/:id:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await fetchUsers();

    // Simulate some delay
    setTimeout(() => {
      res.json(users);
    }, 100);
  } catch (error) {
    console.error('Error in /api/users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const users = await fetchUsers();
    const id = parseInt(req.params.id);
    const user = users.find((u: any) => u.id === id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simulate some delay
    setTimeout(() => {
      res.json(user);
    }, 120);
  } catch (error) {
    console.error('Error in /api/users/:id:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
