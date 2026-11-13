/**
 * MyntraFlash Standalone Native Load Simulator (Zero-Dependency Node.js)
 * Cloud Computing Course Project — Group 33
 * 
 * Allows immediate load testing and benchmarking on any machine without needing k6 installed.
 * Usage:
 *   node simulate-load.js [TARGET_URL] [CONCURRENCY] [TOTAL_REQUESTS]
 * Example:
 *   node simulate-load.js http://localhost:3000 30 500
 *   node simulate-load.js http://34.118.x.x 50 1000
 */

const TARGET_URL = process.argv[2] || process.env.TARGET_URL || 'http://localhost:3000';
const CONCURRENCY = parseInt(process.argv[3] || '25', 10);
const TOTAL_REQUESTS = parseInt(process.argv[4] || '200', 10);

console.log('================================================================');
console.log('⚡ MyntraFlash Native Multi-Threaded Load Generator');
console.log(`🎯 Target URL:        ${TARGET_URL}`);
console.log(`👥 Concurrent Workers: ${CONCURRENCY}`);
console.log(`📦 Total Requests:    ${TOTAL_REQUESTS}`);
console.log('================================================================\n');

const latencies = [];
const nodeDistribution = {};
let completed = 0;
let errors = 0;
const startTime = Date.now();

// Calculate percentiles
function getPercentile(arr, p) {
  if (arr.length === 0) return 0;
  const index = Math.ceil((p / 100) * arr.length) - 1;
  return arr[index];
}

async function sendRequest(id) {
  const reqStart = performance.now();
  try {
    const isCheckout = Math.random() < 0.6; // 60% checkouts (CPU intensive), 40% catalog
    let url, method, body;

    if (isCheckout) {
      url = `${TARGET_URL}/api/checkout`;
      method = 'POST';
      body = JSON.stringify({
        productId: Math.floor(Math.random() * 8) + 1,
        quantity: 1,
        customerId: `sim-worker-${id}`
      });
    } else {
      url = `${TARGET_URL}/api/products`;
      method = 'GET';
      body = null;
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body
    });

    const duration = performance.now() - reqStart;
    latencies.push(duration);

    if (!res.ok) {
      errors++;
    } else {
      const data = await res.json();
      const node = data.telemetry?.servedByInstance || data.hostname || 'unknown-vm';
      nodeDistribution[node] = (nodeDistribution[node] || 0) + 1;
    }
  } catch (err) {
    errors++;
    latencies.push(performance.now() - reqStart);
  } finally {
    completed++;
    if (completed % 25 === 0 || completed === TOTAL_REQUESTS) {
      process.stdout.write(`\rProgress: [${completed}/${TOTAL_REQUESTS}] requests completed (${errors} failed)...`);
    }
  }
}

async function runWorker(workerId) {
  while (true) {
    if (completed >= TOTAL_REQUESTS) break;
    await sendRequest(workerId);
  }
}

async function main() {
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(runWorker(i));
  }
  await Promise.all(workers);

  const totalTimeSec = (Date.now() - startTime) / 1000;
  latencies.sort((a, b) => a - b);

  const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
  const p50 = getPercentile(latencies, 50).toFixed(2);
  const p90 = getPercentile(latencies, 90).toFixed(2);
  const p95 = getPercentile(latencies, 95).toFixed(2);
  const p99 = getPercentile(latencies, 99).toFixed(2);
  const throughput = (completed / totalTimeSec).toFixed(2);
  const errorPercentage = ((errors / completed) * 100).toFixed(2);

  console.log('\n\n================================================================');
  console.log('📊 EXPERIMENTAL TELEMETRY SUMMARY REPORT');
  console.log('================================================================');
  console.log(`⏱️  Total Duration:         ${totalTimeSec.toFixed(2)} seconds`);
  console.log(`🚀 Throughput:              ${throughput} req/sec`);
  console.log(`✅ Completed:               ${completed} requests`);
  console.log(`❌ Failed:                  ${errors} requests (${errorPercentage}%)`);
  console.log('----------------------------------------------------------------');
  console.log('📈 LATENCY DISTRIBUTION PERCENTILES:');
  console.log(`   • Average Latency:       ${avgLatency} ms`);
  console.log(`   • p50 (Median):          ${p50} ms`);
  console.log(`   • p90:                   ${p90} ms`);
  console.log(`   • p95:                   ${p95} ms`);
  console.log(`   • p99 (Worst Case):      ${p99} ms`);
  console.log('----------------------------------------------------------------');
  console.log('🌐 LOAD BALANCER NODE DISTRIBUTION:');
  for (const [node, count] of Object.entries(nodeDistribution)) {
    const share = ((count / (completed - errors)) * 100).toFixed(1);
    console.log(`   • Instance [${node}]: ${count} requests (${share}%)`);
  }
  console.log('================================================================\n');
}

main();

