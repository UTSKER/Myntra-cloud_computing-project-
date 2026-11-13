/**
 * MyntraFlash High-Performance Native Load Simulator (Zero-Dependency Node.js)
 * Cloud Computing Course Project — Group 33
 * 
 * Engineered for massive concurrency (100k - 1M requests scale) with
 * persistent HTTP Keep-Alive connection pooling to eliminate socket exhaustion.
 * 
 * Usage:
 *   node simulate-load.js [TARGET_URL] [CONCURRENCY] [TOTAL_REQUESTS]
 * Example:
 *   node simulate-load.js http://8.233.167.150 150 10000
 *   node simulate-load.js http://8.233.167.150 300 50000
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const TARGET_URL = process.argv[2] || process.env.TARGET_URL || 'http://localhost:3000';
const CONCURRENCY = parseInt(process.argv[3] || '50', 10);
const TOTAL_REQUESTS = parseInt(process.argv[4] || '1000', 10);

const targetParsed = new URL(TARGET_URL);
const isHttps = targetParsed.protocol === 'https:';
const clientModule = isHttps ? https : http;

// High-capacity HTTP Agent maintaining pooled TCP sockets to prevent socket starvation
const agent = new clientModule.Agent({
  keepAlive: true,
  maxSockets: Math.max(100, CONCURRENCY * 2),
  maxFreeSockets: 100,
  timeout: 30000
});

console.log('================================================================');
console.log('⚡ MyntraFlash Enterprise-Grade Load Generator (Keep-Alive Pooled)');
console.log(`🎯 Target Endpoint:    ${TARGET_URL}`);
console.log(`👥 Concurrent Workers: ${CONCURRENCY}`);
console.log(`📦 Target Requests:    ${TOTAL_REQUESTS}`);
console.log(`🔌 Connection Pooling: Enabled (Max ${agent.maxSockets} sockets)`);
console.log('================================================================\n');

const latencies = [];
const nodeDistribution = {};
let completed = 0;
let errors = 0;
const startTime = Date.now();

function getPercentile(arr, p) {
  if (arr.length === 0) return 0;
  const index = Math.ceil((p / 100) * arr.length) - 1;
  return arr[index];
}

function executeRequest(workerId) {
  return new Promise((resolve) => {
    const isCheckout = Math.random() < 0.6; // 60% checkouts, 40% catalog queries
    const reqPath = isCheckout ? '/api/checkout' : '/api/products';
    const method = isCheckout ? 'POST' : 'GET';
    const postData = isCheckout ? JSON.stringify({
      productId: Math.floor(Math.random() * 8) + 1,
      quantity: 1,
      customerId: `worker-${workerId}`
    }) : null;

    const options = {
      protocol: targetParsed.protocol,
      hostname: targetParsed.hostname,
      port: targetParsed.port || (isHttps ? 443 : 80),
      path: reqPath,
      method: method,
      agent: agent,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MyntraFlash-Enterprise-LoadTest/2.0'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const reqStart = performance.now();
    const req = clientModule.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const duration = performance.now() - reqStart;
        latencies.push(duration);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(body);
            const node = data.telemetry?.servedByInstance || data.hostname || 'unknown-vm';
            nodeDistribution[node] = (nodeDistribution[node] || 0) + 1;
          } catch {
            nodeDistribution['unparsed-node'] = (nodeDistribution['unparsed-node'] || 0) + 1;
          }
        } else {
          errors++;
        }
        completed++;
        printProgress();
        resolve();
      });
    });

    req.on('error', () => {
      errors++;
      completed++;
      latencies.push(performance.now() - reqStart);
      printProgress();
      resolve();
    });

    req.setTimeout(20000, () => {
      req.destroy();
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function printProgress() {
  if (completed % 100 === 0 || completed === TOTAL_REQUESTS) {
    const errorPct = completed > 0 ? ((errors / completed) * 100).toFixed(1) : 0;
    process.stdout.write(`\rProgress: [${completed}/${TOTAL_REQUESTS}] (${errorPct}% err, ${(completed / ((Date.now() - startTime) / 1000)).toFixed(0)} req/s)...`);
  }
}

async function runWorker(workerId) {
  while (completed < TOTAL_REQUESTS) {
    await executeRequest(workerId);
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

  const avgLatency = latencies.length ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2) : 0;
  const p50 = getPercentile(latencies, 50).toFixed(2);
  const p90 = getPercentile(latencies, 90).toFixed(2);
  const p95 = getPercentile(latencies, 95).toFixed(2);
  const p99 = getPercentile(latencies, 99).toFixed(2);
  const throughput = (completed / totalTimeSec).toFixed(2);
  const errorPercentage = completed ? ((errors / completed) * 100).toFixed(2) : 0;

  console.log('\n\n================================================================');
  console.log('📊 EXPERIMENTAL TELEMETRY SUMMARY REPORT');
  console.log('================================================================');
  console.log(`⏱️  Total Duration:         ${totalTimeSec.toFixed(2)} seconds`);
  console.log(`🚀 Throughput:              ${throughput} req/sec`);
  console.log(`✅ Total Completed:         ${completed} requests`);
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
  const validRequests = completed - errors;
  for (const [node, count] of Object.entries(nodeDistribution)) {
    const share = validRequests > 0 ? ((count / validRequests) * 100).toFixed(1) : 0;
    console.log(`   • Instance [${node}]: ${count} requests (${share}%)`);
  }
  console.log('================================================================\n');
}

main();
