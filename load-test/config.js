/**
 * MyntraFlash - Load Testing Configuration
 * Cloud Computing Course Project — Group 33
 */

// Target URL defaults to local microservice, or can be specified via environment variable
// e.g., k6 run -e TARGET_URL=http://34.x.x.x flash-sale-spike.js
export const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

// Standard HTTP Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'k6-load-tester/myntraflash-simulation'
};

// SLA & Performance Thresholds
export const STANDARD_THRESHOLDS = {
  // Global error rate must remain under 1% for healthy operations
  http_req_failed: ['rate<0.01'],
  // 95% of requests should complete within 400ms during normal traffic
  http_req_duration: ['p(95)<400', 'p(99)<800']
};

export const FLASH_THRESHOLDS = {
  // During high-concurrency flash surges, allow grace for queuing
  http_req_failed: ['rate<0.05'], // Max 5% errors during extreme 500-VU spikes
  http_req_duration: ['p(95)<1200', 'p(99)<2500']
};

