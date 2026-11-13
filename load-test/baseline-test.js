/**
 * Experiment 1 & 2: Baseline & Fixed-Capacity Load Test
 * Cloud Computing Course Project — Group 33
 * 
 * Objective: Measure steady-state performance (latency percentiles p50, p95, p99,
 * throughput, and error rate) across fixed capacity configurations (1 VM vs 2 VMs vs 3 VMs).
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { BASE_URL, DEFAULT_HEADERS, STANDARD_THRESHOLDS } from './config.js';

// Custom metric definitions
const productsLatency = new Trend('products_duration_ms');
const discountLatency = new Trend('discount_duration_ms');
const recommendLatency = new Trend('recommend_duration_ms');
const successfulRequests = new Counter('successful_requests');
const errorRate = new Rate('custom_error_rate');

// Test scenario options
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Warmup to 20 VUs
    { duration: '1m', target: 50 },   // Ramp to 50 VUs (steady baseline)
    { duration: '3m', target: 50 },   // Sustain 50 VUs
    { duration: '30s', target: 0 }    // Ramp down to 0
  ],
  thresholds: {
    ...STANDARD_THRESHOLDS,
    'products_duration_ms': ['p(95)<300'],
    'discount_duration_ms': ['p(95)<450']
  }
};

export default function () {
  // Weighted randomized browsing behavior (40% catalog, 25% flash, 20% discount, 15% recommend)
  const rand = Math.random();

  if (rand < 0.40) {
    // 40% Product Catalog Queries
    const res = http.get(`${BASE_URL}/api/products`, { headers: DEFAULT_HEADERS, tags: { name: 'GetProducts' } });
    productsLatency.add(res.timings.duration);
    const passed = check(res, {
      'products status is 200': (r) => r.status === 200,
      'products returned': (r) => r.json('products') && r.json('products').length > 0
    });
    errorRate.add(!passed);
    if (passed) successfulRequests.add(1);

  } else if (rand < 0.65) {
    // 25% Flash Sale Overview
    const res = http.get(`${BASE_URL}/flash-sale`, { headers: DEFAULT_HEADERS, tags: { name: 'GetFlashSale' } });
    const passed = check(res, {
      'flash sale status is 200': (r) => r.status === 200,
      'flash sale is LIVE': (r) => r.json('status') === 'LIVE'
    });
    errorRate.add(!passed);
    if (passed) successfulRequests.add(1);

  } else if (rand < 0.85) {
    // 20% Pricing & Discount Engine Evaluation (Moderate CPU work)
    const res = http.get(`${BASE_URL}/api/discount`, { headers: DEFAULT_HEADERS, tags: { name: 'GetDiscount' } });
    discountLatency.add(res.timings.duration);
    const passed = check(res, {
      'discount status is 200': (r) => r.status === 200,
      'token present': (r) => r.json('verificationToken') !== undefined
    });
    errorRate.add(!passed);
    if (passed) successfulRequests.add(1);

  } else {
    // 15% Personalized Recommendation Algorithm
    const res = http.get(`${BASE_URL}/api/recommend`, { headers: DEFAULT_HEADERS, tags: { name: 'GetRecommend' } });
    recommendLatency.add(res.timings.duration);
    const passed = check(res, {
      'recommend status is 200': (r) => r.status === 200,
      'recommendations received': (r) => r.json('recommendations') && r.json('recommendations').length > 0
    });
    errorRate.add(!passed);
    if (passed) successfulRequests.add(1);
  }

  // Realistic human think-time pacing (between 100ms and 500ms)
  sleep(Math.random() * 0.4 + 0.1);
}

