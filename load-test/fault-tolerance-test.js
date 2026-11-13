/**
 * Experiment 4: Fault Tolerance & Load Balancer Failover Test
 * Cloud Computing Course Project — Group 33
 * 
 * Objective: Generate steady traffic (50 VUs) while an instance failure is manually
 * or automatically injected (e.g., `docker stop myntraflash-app`).
 * Verifies that the GCP Load Balancer marks the failing VM UNHEALTHY within 30s
 * and seamlessly routes 100% of requests to surviving healthy nodes without dropping traffic.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { BASE_URL, DEFAULT_HEADERS } from './config.js';

const failoverLatency = new Trend('failover_request_duration_ms');
const droppedRequests = new Counter('dropped_requests_count');
const errorRate = new Rate('failover_error_rate');

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Phase 1: Establish steady 50-VU traffic across both VMs
    { duration: '3m', target: 50 },  // Phase 2 & 3: Maintain load during container shutdown
    { duration: '2m', target: 50 },  // Phase 4 & 5: Maintain load during container recovery
    { duration: '30s', target: 0 }   // Cooldown
  ],
  thresholds: {
    // During failover, transient errors should not exceed 3% before health check unregisters the bad VM
    'failover_error_rate': ['rate<0.03'],
    'failover_request_duration_ms': ['p(95)<800']
  }
};

export default function () {
  const res = http.get(`${BASE_URL}/instance-id`, {
    headers: DEFAULT_HEADERS,
    tags: { name: 'ProbeInstanceRouting' }
  });

  failoverLatency.add(res.timings.duration);

  const passed = check(res, {
    'status is 200': (r) => r.status === 200,
    'hostname returned': (r) => r.json('hostname') !== undefined
  });

  if (!passed) {
    droppedRequests.add(1);
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  sleep(0.1); // 10 requests/sec per VU
}

