/**
 * Experiment 3: Dynamic Flash-Sale Spike & Autoscaling Hysteresis Test
 * Cloud Computing Course Project — Group 33
 * 
 * Objective: Force fleet CPU utilization above 70% using high-concurrency
 * synthetic orders, triggering reactive horizontal scale-out (1 -> 2 -> 3 VMs),
 * followed by traffic decay to observe cool-down and scale-in behavior.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { BASE_URL, DEFAULT_HEADERS, FLASH_THRESHOLDS } from './config.js';

// Custom Metrics for Cloud Autoscaling Telemetry
const checkoutLatency = new Trend('checkout_duration_ms');
const cpuComputeTime = new Trend('server_cpu_compute_ms');
const ordersPlaced = new Counter('total_orders_placed');
const errorRate = new Rate('checkout_failure_rate');

// 6-Phase Flash-Sale Workload Profile matching Week 2 Exercise Plan
export const options = {
  stages: [
    // Phase 1: Off-peak baseline (3 min @ 20 VUs, CPU ~20%)
    { duration: '2m', target: 20 },
    // Phase 2: Pre-sale ramp (Ramp 20 -> 150 VUs as sale opens)
    { duration: '2m', target: 150 },
    // Phase 3: Sustained Peak (Sustain 150 VUs, drives CPU > 70%, triggers 1st scale-out)
    { duration: '4m', target: 150 },
    // Phase 4: Extreme Flash Spike (Burst to 500 VUs, triggers 2nd scale-out to 3 VMs)
    { duration: '3m', target: 500 },
    // Phase 5: Post-Sale Decay (Traffic drops abruptly 500 -> 20 VUs)
    { duration: '2m', target: 20 },
    // Phase 6: Cooldown & Decay (Low load to observe 300s scale-in stabilization)
    { duration: '5m', target: 20 }
  ],
  thresholds: FLASH_THRESHOLDS
};

export default function () {
  const rand = Math.random();

  if (rand < 0.60) {
    // 60% Flash Sale Purchase Checkout (CPU-intensive cryptographic order verification)
    const randomProduct = Math.floor(Math.random() * 8) + 1;
    const payload = JSON.stringify({
      productId: randomProduct,
      quantity: 1,
      customerId: `k6-vu-${__VU}-iter-${__ITER}`
    });

    const res = http.post(`${BASE_URL}/api/checkout`, payload, {
      headers: DEFAULT_HEADERS,
      tags: { name: 'PostCheckout' }
    });

    checkoutLatency.add(res.timings.duration);

    const passed = check(res, {
      'checkout status is 200': (r) => r.status === 200,
      'order ID generated': (r) => r.json('orderId') !== undefined,
      'served by instance returned': (r) => r.json('telemetry.servedByInstance') !== undefined
    });

    if (passed && res.json('telemetry.cpuComputeTimeMs')) {
      cpuComputeTime.add(res.json('telemetry.cpuComputeTimeMs'));
      ordersPlaced.add(1);
    }
    errorRate.add(!passed);

  } else if (rand < 0.85) {
    // 25% Product Catalog & Inventory Refresh
    const res = http.get(`${BASE_URL}/api/products`, {
      headers: DEFAULT_HEADERS,
      tags: { name: 'GetCatalog' }
    });
    check(res, { 'catalog 200': (r) => r.status === 200 });

  } else {
    // 15% Dynamic Discount Evaluation
    const res = http.get(`${BASE_URL}/api/discount`, {
      headers: DEFAULT_HEADERS,
      tags: { name: 'GetDiscount' }
    });
    check(res, { 'discount 200': (r) => r.status === 200 });
  }

  // Rapid pacing during flash surge (20ms to 100ms)
  sleep(Math.random() * 0.08 + 0.02);
}

