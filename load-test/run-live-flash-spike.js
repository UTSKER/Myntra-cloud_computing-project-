/**
 * run-live-flash-spike.js
 * Cloud Computing Capstone Project — Group 33
 * 
 * Executes a REAL-TIME, DYNAMIC FLASH SALE SPIKE (Flash Crowd / Step-Function Impulse)
 * against http://myntra.divyesh.site on Google Cloud Platform (asia-south1 Mumbai).
 * 
 * Workload Waveform:
 *   Phase 1 (Baseline Off-Peak):  10 VUs for 25 seconds (quiet single-node state)
 *   Phase 2 (Midnight Flash Surge): Sudden 15x impulse jump to 150 VUs for 100 seconds
 *   Phase 3 (Post-Sale Decay):    Sudden drop back to 10 VUs for 30 seconds
 * 
 * Captures second-by-second time-series telemetry:
 *   - Provisioning lag & queue shock
 *   - Multi-VM scale-out absorption & latency recovery
 *   - Post-sale traffic decay
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

const TARGET_URL = process.argv[2] || process.env.TARGET_URL || 'http://myntra.divyesh.site';
const targetParsed = new URL(TARGET_URL);
const isHttps = targetParsed.protocol === 'https:';
const clientModule = isHttps ? https : http;

const agent = new clientModule.Agent({
  keepAlive: true,
  maxSockets: 400,
  maxFreeSockets: 100,
  timeout: 30000
});

// Phase Definitions (total 155 seconds ~ 2.6 mins)
const PHASES = [
  { name: 'Phase 1: Baseline Off-Peak', durationSec: 25, targetVUs: 10 },
  { name: 'Phase 2: FLASH SALE SPIKE!', durationSec: 100, targetVUs: 150 },
  { name: 'Phase 3: Post-Sale Decay',   durationSec: 30, targetVUs: 10 }
];

const TOTAL_DURATION_SEC = PHASES.reduce((acc, p) => acc + p.durationSec, 0);

console.log('================================================================');
console.log('⚡ MyntraFlash Live Dynamic Flash Sale Spike Generator');
console.log(`🎯 Target Endpoint:    ${TARGET_URL}`);
console.log(`⏱️  Total Duration:     ${TOTAL_DURATION_SEC} seconds (~2.6 minutes)`);
console.log('📈 Workload Profile:');
console.log('   • Phase 1 (00:00 - 00:25): Baseline Off-Peak (10 VUs)');
console.log('   • Phase 2 (00:25 - 02:05): Sudden Flash Surge (150 VUs — 15x Jump!)');
console.log('   • Phase 3 (02:05 - 02:35): Post-Sale Demand Decay (10 VUs)');
console.log('🔌 Connection Pooling: Enabled (Max 400 Keep-Alive Sockets)');
console.log('================================================================\n');

// Time-series recording
const timeSeries = [];
let totalRequests = 0;
let totalErrors = 0;
const allLatencies = [];
const clusterNodes = {};

let currentPhase = PHASES[0];
let activeWorkers = 0;
let desiredWorkers = PHASES[0].targetVUs;
let isRunning = true;
const testStartTime = Date.now();

// Window metrics (every 3 seconds)
let windowStart = Date.now();
let windowLatencies = [];
let windowCompleted = 0;
let windowErrors = 0;
let windowNodes = {};

function getPercentile(arr, p) {
  if (arr.length === 0) return 0;
  const index = Math.ceil((p / 100) * arr.length) - 1;
  return arr[index];
}

function sendRequest() {
  return new Promise((resolve) => {
    const isCheckout = Math.random() < 0.60; // 60% CPU checkout, 40% catalog
    const reqPath = isCheckout ? '/api/checkout' : '/api/products';
    const method = isCheckout ? 'POST' : 'GET';
    const postData = isCheckout ? JSON.stringify({
      productId: Math.floor(Math.random() * 8) + 1,
      quantity: 1,
      customerId: `spike-worker-${Math.floor(Math.random() * 10000)}`
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
        'User-Agent': 'MyntraFlash-LiveFlashSpikeTest/1.0'
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
        const dur = performance.now() - reqStart;
        allLatencies.push(dur);
        windowLatencies.push(dur);
        totalRequests++;
        windowCompleted++;

        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(body);
            const node = data.telemetry?.servedByInstance || data.hostname || 'unknown-vm';
            clusterNodes[node] = (clusterNodes[node] || 0) + 1;
            windowNodes[node] = (windowNodes[node] || 0) + 1;
          } catch {
            clusterNodes['unparsed'] = (clusterNodes['unparsed'] || 0) + 1;
          }
        } else {
          totalErrors++;
          windowErrors++;
        }
        resolve();
      });
    });

    req.on('error', () => {
      const dur = performance.now() - reqStart;
      allLatencies.push(dur);
      windowLatencies.push(dur);
      totalRequests++;
      windowCompleted++;
      totalErrors++;
      windowErrors++;
      resolve();
    });

    req.setTimeout(15000, () => {
      req.destroy();
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Dynamic Worker Pool Management
async function workerLoop(id) {
  activeWorkers++;
  while (isRunning) {
    if (activeWorkers > desiredWorkers) {
      // Scale down worker pool
      break;
    }
    await sendRequest();
    // Pacing: slight jitter to mimic realistic user think-time
    const thinkMs = desiredWorkers > 50 ? (Math.random() * 20 + 5) : (Math.random() * 50 + 20);
    await new Promise(r => setTimeout(r, thinkMs));
  }
  activeWorkers--;
}

function adjustWorkers() {
  while (activeWorkers < desiredWorkers && isRunning) {
    workerLoop(activeWorkers);
  }
}

// Phase Orchestrator
async function runOrchestrator() {
  let elapsed = 0;
  for (const phase of PHASES) {
    currentPhase = phase;
    desiredWorkers = phase.targetVUs;
    adjustWorkers();
    console.log(`\n🔔 [${new Date().toLocaleTimeString()}] >>> TRANSITION TO: ${phase.name} (Target: ${phase.targetVUs} VUs) <<<`);
    
    const phaseStart = Date.now();
    while ((Date.now() - phaseStart) < phase.durationSec * 1000) {
      adjustWorkers();
      await new Promise(r => setTimeout(r, 500));
    }
  }
  isRunning = false;
}

// 3-Second Window Sampler for Time-Series Plotting
function startTelemetrySampler() {
  const timer = setInterval(() => {
    if (!isRunning && activeWorkers === 0) {
      clearInterval(timer);
      return;
    }

    const now = Date.now();
    const elapsedSec = Math.round((now - testStartTime) / 1000);
    const windowSec = (now - windowStart) / 1000;
    const rps = windowSec > 0 ? (windowCompleted / windowSec) : 0;
    const errPct = windowCompleted > 0 ? ((windowErrors / windowCompleted) * 100) : 0;

    windowLatencies.sort((a, b) => a - b);
    const p50 = getPercentile(windowLatencies, 50);
    const p95 = getPercentile(windowLatencies, 95);
    const p99 = getPercentile(windowLatencies, 99);
    const avg = windowLatencies.length ? (windowLatencies.reduce((a, b) => a + b, 0) / windowLatencies.length) : 0;

    const uniqueNodesInWindow = Object.keys(windowNodes);
    const totalUniqueNodesSoFar = Object.keys(clusterNodes);

    const snapshot = {
      elapsedSec,
      phaseName: currentPhase.name,
      targetVUs: currentPhase.targetVUs,
      activeWorkers,
      windowRequests: windowCompleted,
      windowErrors,
      rps: parseFloat(rps.toFixed(2)),
      errorPct: parseFloat(errPct.toFixed(2)),
      p50Ms: parseFloat(p50.toFixed(2)),
      p95Ms: parseFloat(p95.toFixed(2)),
      p99Ms: parseFloat(p99.toFixed(2)),
      avgMs: parseFloat(avg.toFixed(2)),
      nodesInWindow: uniqueNodesInWindow,
      nodeCountInWindow: uniqueNodesInWindow.length,
      cumulativeUniqueNodeCount: totalUniqueNodesSoFar.length
    };
    timeSeries.push(snapshot);

    const m = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
    const s = (elapsedSec % 60).toString().padStart(2, '0');
    console.log(
      `⏱️ [${m}:${s}] ${snapshot.phaseName.padEnd(28)} | VUs: ${String(activeWorkers).padStart(3)} | ` +
      `RPS: ${rps.toFixed(1).padStart(5)} | p50: ${p50.toFixed(0).padStart(4)}ms | p95: ${p95.toFixed(0).padStart(5)}ms | ` +
      `Err: ${errPct.toFixed(1)}% | Active VMs: ${uniqueNodesInWindow.length} (${uniqueNodesInWindow.join(', ') || 'none'})`
    );

    // Reset window
    windowStart = Date.now();
    windowCompleted = 0;
    windowErrors = 0;
    windowLatencies = [];
    windowNodes = {};
  }, 3000);
}

async function main() {
  startTelemetrySampler();
  await runOrchestrator();

  // Wait for all workers to cleanly drain
  while (activeWorkers > 0) {
    await new Promise(r => setTimeout(r, 200));
  }

  const totalTimeSec = (Date.now() - testStartTime) / 1000;
  allLatencies.sort((a, b) => a - b);

  const avgLatency = allLatencies.length ? (allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length).toFixed(2) : 0;
  const p50 = getPercentile(allLatencies, 50).toFixed(2);
  const p90 = getPercentile(allLatencies, 90).toFixed(2);
  const p95 = getPercentile(allLatencies, 95).toFixed(2);
  const p99 = getPercentile(allLatencies, 99).toFixed(2);
  const overallRps = (totalRequests / totalTimeSec).toFixed(2);
  const overallErrPct = totalRequests ? ((totalErrors / totalRequests) * 100).toFixed(2) : 0;

  console.log('\n\n================================================================');
  console.log('📊 LIVE FLASH SALE SPIKE TELEMETRY SUMMARY');
  console.log('================================================================');
  console.log(`⏱️  Total Duration:         ${totalTimeSec.toFixed(2)} seconds`);
  console.log(`🚀 Overall Throughput:      ${overallRps} req/sec`);
  console.log(`✅ Total Completed:         ${totalRequests} requests`);
  console.log(`❌ Failed / Timeouts:       ${totalErrors} requests (${overallErrPct}%)`);
  console.log('----------------------------------------------------------------');
  console.log('📈 AGGREGATE LATENCY PERCENTILES:');
  console.log(`   • Average Latency:       ${avgLatency} ms`);
  console.log(`   • p50 (Median):          ${p50} ms`);
  console.log(`   • p90:                   ${p90} ms`);
  console.log(`   • p95:                   ${p95} ms`);
  console.log(`   • p99 (Peak Surge):      ${p99} ms`);
  console.log('----------------------------------------------------------------');
  console.log('🌐 TOTAL RESPONDING NODES ACROSS SPIKE:');
  const validRequests = totalRequests - totalErrors;
  for (const [node, count] of Object.entries(clusterNodes)) {
    const share = validRequests > 0 ? ((count / validRequests) * 100).toFixed(1) : 0;
    console.log(`   • Node [${node}]: ${count} requests (${share}%)`);
  }
  console.log('================================================================\n');

  // Export full JSON results
  const reportData = {
    testName: "Live Dynamic Flash Sale Spike Experiment",
    targetUrl: TARGET_URL,
    totalDurationSeconds: totalTimeSec,
    totalRequests,
    totalErrors,
    overallThroughputRps: parseFloat(overallRps),
    overallErrorRatePct: parseFloat(overallErrPct),
    aggregateLatencyMs: {
      avg: parseFloat(avgLatency),
      p50: parseFloat(p50),
      p90: parseFloat(p90),
      p95: parseFloat(p95),
      p99: parseFloat(p99)
    },
    clusterNodeDistribution: clusterNodes,
    timeSeries
  };

  const out1 = path.join(__dirname, '..', 'results', 'live-benchmarks', 'live-flash-sale-spike.json');
  const out2 = path.join(__dirname, '..', 'results', 'experiment-3-autoscaling', 'live-flash-spike-telemetry.json');
  
  fs.mkdirSync(path.dirname(out1), { recursive: true });
  fs.mkdirSync(path.dirname(out2), { recursive: true });

  fs.writeFileSync(out1, JSON.stringify(reportData, null, 2), 'utf-8');
  fs.writeFileSync(out2, JSON.stringify(reportData, null, 2), 'utf-8');

  console.log(`💾 Saved live time-series to:`);
  console.log(`   1. ${out1}`);
  console.log(`   2. ${out2}`);
}

main().catch(console.error);

