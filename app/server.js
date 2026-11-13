/**
 * MyntraFlash - High-Scale Flash-Sale Simulation Microservice
 * Cloud Computing Course Project — Group 33
 * 
 * Target Deployment: Google Cloud Platform (asia-south1 Mumbai)
 * Compute: GCE Managed Instance Groups (MIG) with CPU Autoscaler
 * Traffic: Cloud Load Balancing (External Layer 7 Application Load Balancer)
 */

const express = require('express');
const cors = require('cors');
const os = require('os');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOSTNAME = os.hostname();
const REGION = process.env.GCP_REGION || 'asia-south1 (Mumbai)';
const DEFAULT_CPU_ITERATIONS = parseInt(process.env.CPU_ITERATIONS, 10) || 1200;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sampled request logging to prevent stdout I/O bottlenecks during high-throughput flash floods
let reqCounter = 0;
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  reqCounter++;
  const shouldLog = reqCounter % 50 === 0;
  const start = process.hrtime();
  res.on('finish', () => {
    if (shouldLog) {
      const diff = process.hrtime(start);
      const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      console.log(`[${new Date().toISOString()}] (Sampled 1/50) ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms - [${HOSTNAME}]`);
    }
  });
  next();
});

// ==============================================================================
// In-Memory Product & Flash-Sale State (Stateless Cloud Tier)
// ==============================================================================
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Roadster Olive Regular Cotton Shirt',
    category: 'Men Fashion',
    originalPrice: 1599,
    discountPercent: 65,
    salePrice: 559,
    initialStock: 250,
    currentStock: 250,
    rating: 4.3,
    reviews: 1420,
    badge: '65% OFF',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    name: 'HRX by Hrithik Roshan Running Shoes',
    category: 'Sportswear & Footwear',
    originalPrice: 3999,
    discountPercent: 55,
    salePrice: 1799,
    initialStock: 180,
    currentStock: 180,
    rating: 4.5,
    reviews: 3200,
    badge: 'BESTSELLER',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    name: 'Anouk Women Embroidered Festive Kurta',
    category: 'Ethnic Wear',
    originalPrice: 2799,
    discountPercent: 60,
    salePrice: 1119,
    initialStock: 150,
    currentStock: 150,
    rating: 4.4,
    reviews: 980,
    badge: 'TRENDING',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    name: 'Mast & Harbour Chronograph Watch',
    category: 'Accessories',
    originalPrice: 4499,
    discountPercent: 70,
    salePrice: 1349,
    initialStock: 120,
    currentStock: 120,
    rating: 4.6,
    reviews: 850,
    badge: 'LIMITED DEAL',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    name: 'WROGN Slim Fit Stretchable Denim',
    category: 'Men Jeans',
    originalPrice: 2899,
    discountPercent: 50,
    salePrice: 1449,
    initialStock: 200,
    currentStock: 200,
    rating: 4.2,
    reviews: 1150,
    badge: 'HOT PICK',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    name: 'Puma Retro Colorblock Windbreaker',
    category: 'Jackets & Outerwear',
    originalPrice: 4999,
    discountPercent: 58,
    salePrice: 2099,
    initialStock: 110,
    currentStock: 110,
    rating: 4.7,
    reviews: 640,
    badge: '58% OFF',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 7,
    name: 'Tommy Hilfiger Leather Bifold Wallet',
    category: 'Luxury Accessories',
    originalPrice: 3299,
    discountPercent: 45,
    salePrice: 1814,
    initialStock: 140,
    currentStock: 140,
    rating: 4.6,
    reviews: 430,
    badge: 'PREMIUM',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 8,
    name: 'Lavie Multi-Pocket Structured Tote',
    category: 'Women Handbags',
    originalPrice: 3899,
    discountPercent: 62,
    salePrice: 1481,
    initialStock: 95,
    currentStock: 95,
    rating: 4.3,
    reviews: 720,
    badge: 'FLASH SPECIAL',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'
  }
];

let products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let totalOrdersProcessed = 0;
const serverStartTime = Date.now();

// ==============================================================================
// Helper: Controlled Synthetic CPU Workload
// ==============================================================================
/**
 * Executes deterministic CPU work (iterative SHA-256 cryptographic hashing)
 * to simulate order validation, signature verification, and dynamic pricing rules.
 * This ensures that concurrent k6 traffic drives VM CPU utilization above 70%
 * to reliably trigger GCP Managed Instance Group (MIG) autoscaling.
 */
function computeSyntheticLoad(iterations = DEFAULT_CPU_ITERATIONS) {
  const start = process.hrtime();
  let hash = 'myntra-eors-flash-sale-seed-token';
  for (let i = 0; i < iterations; i++) {
    hash = crypto.createHash('sha256').update(hash + i).digest('hex');
  }
  const diff = process.hrtime(start);
  const cpuDurationMs = parseFloat((diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2));
  return { hash: hash.substring(0, 16), cpuDurationMs };
}

// ==============================================================================
// 1. Health Probe Endpoint (Required by GCP Load Balancer)
// ==============================================================================
/**
 * Target of Google Cloud Load Balancing health check.
 * Must respond with HTTP 200 in <5ms without blocking on application load.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'myntraflash-microservice',
    hostname: HOSTNAME,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// ==============================================================================
// 2. Instance Metadata & Telemetry (Proves Load Balancing & Scaling)
// ==============================================================================
app.get(['/instance-id', '/api/server-info'], (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    hostname: HOSTNAME,
    region: REGION,
    platform: `${os.type()} ${os.release()} (${os.arch()})`,
    nodeVersion: process.version,
    cpus: os.cpus().length,
    cpuModel: os.cpus()[0] ? os.cpus()[0].model : 'Virtual vCPU',
    uptimeSeconds: Math.floor(process.uptime()),
    serverStartTime: new Date(serverStartTime).toISOString(),
    totalOrdersHandledByThisInstance: totalOrdersProcessed,
    memory: {
      rssMb: (memoryUsage.rss / 1024 / 1024).toFixed(1),
      heapUsedMb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(1)
    },
    loadAverage: os.loadavg ? os.loadavg() : [0, 0, 0]
  });
});

// ==============================================================================
// 3. Product Catalog Endpoints
// ==============================================================================
app.get(['/products', '/api/products'], (req, res) => {
  res.json({
    success: true,
    total: products.length,
    hostname: HOSTNAME,
    products: products
  });
});

// Flash Sale Overview & Countdown Information
app.get('/flash-sale', (req, res) => {
  res.json({
    saleName: 'Myntra End of Reason Sale (EORS) - Flash Surge',
    status: 'LIVE',
    serverNode: HOSTNAME,
    region: REGION,
    totalActiveSKUs: products.length,
    totalOrdersRecorded: totalOrdersProcessed,
    timestamp: new Date().toISOString()
  });
});

// ==============================================================================
// 4. Flash-Sale Checkout Transaction Endpoint (Synthetic Scaling Trigger)
// ==============================================================================
app.post('/api/checkout', (req, res) => {
  const start = process.hrtime();
  const { productId, quantity = 1, customerId = 'guest-user' } = req.body;
  
  // Custom CPU intensity from query or header (allows dynamic load testing calibration)
  const reqIterations = req.query.iterations ? parseInt(req.query.iterations, 10) : DEFAULT_CPU_ITERATIONS;
  
  // Execute realistic CPU computation (cryptographic order verification)
  const { hash, cpuDurationMs } = computeSyntheticLoad(reqIterations);

  const product = products.find(p => p.id === parseInt(productId, 10));

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found',
      hostname: HOSTNAME
    });
  }

  // Deduct in-memory stock (auto-replenishes if 0 to maintain continuous load testing without failing)
  if (product.currentStock < quantity) {
    product.currentStock = product.initialStock; // Auto-restock for infinite flash sale simulation
  }
  product.currentStock -= quantity;
  totalOrdersProcessed += 1;

  const totalTimeDiff = process.hrtime(start);
  const totalDurationMs = parseFloat((totalTimeDiff[0] * 1e3 + totalTimeDiff[1] * 1e-6).toFixed(2));

  res.status(200).json({
    success: true,
    orderId: `MYN-EORS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    product: {
      id: product.id,
      name: product.name,
      salePrice: product.salePrice,
      remainingStock: product.currentStock
    },
    quantity: quantity,
    customerId: customerId,
    tokenVerification: hash,
    telemetry: {
      cpuComputeTimeMs: cpuDurationMs,
      totalResponseTimeMs: totalDurationMs,
      servedByInstance: HOSTNAME,
      region: REGION
    },
    timestamp: new Date().toISOString()
  });
});

// ==============================================================================
// 5. Dynamic Pricing & Recommendation Engine (Simulates Enterprise Services)
// ==============================================================================
// Simulates pricing rule evaluations across multiple items
app.get('/api/discount', (req, res) => {
  const iterations = req.query.iterations ? parseInt(req.query.iterations, 10) : 5000;
  const { hash, cpuDurationMs } = computeSyntheticLoad(iterations);
  
  res.json({
    status: 'computed',
    appliedPromo: 'EORS_SUPER_60',
    discountFactor: 0.60,
    verificationToken: hash,
    computeTimeMs: cpuDurationMs,
    hostname: HOSTNAME
  });
});

// Simulates personalized product recommendations scoring
app.get('/api/recommend', (req, res) => {
  const iterations = req.query.iterations ? parseInt(req.query.iterations, 10) : 6000;
  const { hash, cpuDurationMs } = computeSyntheticLoad(iterations);
  
  // Pick 3 random recommended products
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  const recommendations = shuffled.slice(0, 3).map(p => ({
    id: p.id,
    name: p.name,
    salePrice: p.salePrice,
    relevanceScore: (0.85 + Math.random() * 0.14).toFixed(3)
  }));

  res.json({
    status: 'success',
    recommendations,
    scoreVerification: hash,
    computeTimeMs: cpuDurationMs,
    hostname: HOSTNAME
  });
});

// ==============================================================================
// 6. Test Utility: Reset Catalog Stock
// ==============================================================================
app.post('/api/admin/reset', (req, res) => {
  products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  totalOrdersProcessed = 0;
  res.json({
    success: true,
    message: 'Product stock and order counters reset successfully',
    hostname: HOSTNAME
  });
});

// ==============================================================================
// Fallback Route & Graceful Startup
// ==============================================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('================================================================');
  console.log(`🚀 MyntraFlash Microservice running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Instance Hostname: ${HOSTNAME}`);
  console.log(`🌍 Cloud Deployment Region: ${REGION}`);
  console.log(`⚙️  Default Synthetic CPU Workload: ${DEFAULT_CPU_ITERATIONS} iterations`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log('================================================================');
});

// Configure keep-alive timeout strictly greater than GCP Cloud Load Balancer (60s)
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Handle graceful shutdown for GCP MIG rolling replacement & auto-healing
process.on('SIGTERM', () => {
  console.log(`[SIGTERM] Graceful shutdown initiated on instance ${HOSTNAME}...`);
  server.close(() => {
    console.log(`[SIGTERM] Server terminated cleanly.`);
    process.exit(0);
  });
});

