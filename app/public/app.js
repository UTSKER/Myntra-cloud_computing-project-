/**
 * MyntraFlash Frontend Controller
 * Cloud Computing Case Study — Group 33
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const telemetryHost = document.getElementById('telemetryHost');
  const telemetryLatency = document.getElementById('telemetryLatency');
  const telemetryRegion = document.getElementById('telemetryRegion');
  const bmHost = document.getElementById('bmHost');
  const bmLatency = document.getElementById('bmLatency');
  const productGrid = document.getElementById('productGrid');
  const btnRefreshNode = document.getElementById('btnRefreshNode');
  const sessionOrderCountElem = document.getElementById('sessionOrderCount');
  const toastContainer = document.getElementById('toastContainer');
  
  // Demonstration Buttons
  const btnSimulateOrder = document.getElementById('btnSimulateOrder');
  const btnTestDiscount = document.getElementById('btnTestDiscount');
  const btnTestHealth = document.getElementById('btnTestHealth');

  let sessionOrders = 0;

  // ==============================================================================
  // 1. Live Flash-Sale Countdown Timer
  // ==============================================================================
  function initCountdown() {
    let durationSeconds = 4 * 3600 + 28 * 60 + 45; // 04:28:45 initial duration
    const cdHours = document.getElementById('cdHours');
    const cdMinutes = document.getElementById('cdMinutes');
    const cdSeconds = document.getElementById('cdSeconds');

    setInterval(() => {
      if (durationSeconds > 0) {
        durationSeconds--;
        const hrs = Math.floor(durationSeconds / 3600);
        const mins = Math.floor((durationSeconds % 3600) / 60);
        const secs = durationSeconds % 60;

        cdHours.textContent = String(hrs).padStart(2, '0');
        cdMinutes.textContent = String(mins).padStart(2, '0');
        cdSeconds.textContent = String(secs).padStart(2, '0');
      }
    }, 1000);
  }

  // ==============================================================================
  // 2. Fetch Server Instance & Cluster Telemetry
  // ==============================================================================
  async function fetchServerTelemetry() {
    const startTime = performance.now();
    try {
      const res = await fetch('/api/server-info', { cache: 'no-store' });
      const latency = Math.round(performance.now() - startTime);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Update Top Floating Telemetry Bar
      telemetryHost.textContent = data.hostname;
      telemetryLatency.textContent = `${latency} ms`;
      if (data.region) telemetryRegion.textContent = data.region;

      // Update Benchmarking Card
      bmHost.textContent = data.hostname;
      bmLatency.textContent = `${latency} ms`;

    } catch (err) {
      telemetryHost.textContent = 'Connection Error';
      telemetryLatency.textContent = '--';
      bmHost.textContent = 'Offline';
      console.error('Failed to probe instance telemetry:', err);
    }
  }

  // ==============================================================================
  // 3. Fetch & Render Product Catalog
  // ==============================================================================
  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      renderProducts(data.products);
    } catch (err) {
      productGrid.innerHTML = `
        <div class="loading-state">
          <p style="color: #ef4444; font-weight: 700;">Failed to load catalog from server.</p>
          <p style="font-size: 12px; margin-top: 8px;">Check if the backend microservice is running.</p>
        </div>
      `;
      console.error('Catalog fetch error:', err);
    }
  }

  function renderProducts(products) {
    if (!products || products.length === 0) {
      productGrid.innerHTML = '<p>No products available.</p>';
      return;
    }

    productGrid.innerHTML = products.map(product => {
      const stockPercent = Math.max(0, Math.min(100, Math.round((product.currentStock / product.initialStock) * 100)));
      return `
        <div class="product-card" id="product-${product.id}">
          <div class="product-img-wrapper">
            <img class="product-img" src="${product.image}" alt="${product.name}" loading="lazy">
            <span class="product-badge">${product.badge}</span>
            <span class="product-rating">
              <span class="star">★</span> ${product.rating} | ${(product.reviews / 1000).toFixed(1)}k
            </span>
          </div>
          <div class="product-details">
            <span class="product-category">${product.category}</span>
            <h3 class="product-title">${product.name}</h3>
            
            <div class="pricing-row">
              <span class="sale-price">₹${product.salePrice}</span>
              <span class="original-price">₹${product.originalPrice}</span>
              <span class="discount-tag">(${product.discountPercent}% OFF)</span>
            </div>

            <div class="stock-status-box">
              <div class="stock-labels">
                <span class="stock-warning">⚡ Flash Stock Left</span>
                <span class="stock-qty" id="stock-val-${product.id}">${product.currentStock} units</span>
              </div>
              <div class="stock-meter-bg">
                <div class="stock-meter-fill" id="meter-${product.id}" style="width: ${stockPercent}%;"></div>
              </div>
            </div>

            <button class="btn-buy" data-id="${product.id}" onclick="handleBuyNow(${product.id}, this)">
              ⚡ BUY NOW (FLASH CHECKOUT)
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==============================================================================
  // 4. Handle Flash Purchase Action (POST /api/checkout)
  // ==============================================================================
  window.handleBuyNow = async function(productId, btnElement) {
    if (btnElement) {
      btnElement.disabled = true;
      btnElement.innerHTML = `
        <span class="spinner" style="width: 14px; height: 14px; border-width: 2px; margin: 0;"></span>
        Validating...
      `;
    }

    const startLocal = performance.now();
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          quantity: 1,
          customerId: `student-viva-${Math.floor(Math.random() * 1000)}`
        })
      });

      const totalRtt = Math.round(performance.now() - startLocal);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      // Update remaining stock in UI
      const stockValElem = document.getElementById(`stock-val-${productId}`);
      const meterElem = document.getElementById(`meter-${productId}`);
      if (stockValElem && data.product) {
        stockValElem.textContent = `${data.product.remainingStock} units`;
        meterElem.style.width = `${Math.max(5, (data.product.remainingStock / 250) * 100)}%`;
      }

      // Update session orders & telemetry
      sessionOrders++;
      sessionOrderCountElem.textContent = sessionOrders;
      telemetryHost.textContent = data.telemetry.servedByInstance;
      telemetryLatency.textContent = `${totalRtt} ms`;
      bmHost.textContent = data.telemetry.servedByInstance;
      bmLatency.textContent = `${totalRtt} ms`;

      // Show Toast Notification
      showToast({
        title: `Order Confirmed: ${data.orderId}`,
        message: `Purchased: ${data.product.name} (₹${data.product.salePrice})`,
        meta: `Node: ${data.telemetry.servedByInstance} | CPU: ${data.telemetry.cpuComputeTimeMs}ms | RTT: ${totalRtt}ms`,
        isError: false
      });

    } catch (err) {
      showToast({
        title: 'Checkout Failed',
        message: err.message,
        meta: 'Instance overloaded or unavailable',
        isError: true
      });
    } finally {
      if (btnElement) {
        btnElement.disabled = false;
        btnElement.innerHTML = `⚡ BUY NOW (FLASH CHECKOUT)`;
      }
    }
  };

  // ==============================================================================
  // 5. Toast Notification System
  // ==============================================================================
  function showToast({ title, message, meta, isError = false }) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-title">${title}</span>
        <span class="toast-time">Just now</span>
      </div>
      <div class="toast-body">${message}</div>
      ${meta ? `<div class="toast-meta">${meta}</div>` : ''}
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // ==============================================================================
  // 6. Benchmarking & Demonstration Event Handlers
  // ==============================================================================
  btnRefreshNode.addEventListener('click', () => {
    fetchServerTelemetry();
    showToast({
      title: 'Load Balancer Probed',
      message: 'Request routed through Cloud Load Balancer',
      meta: `Targeting: /api/server-info`
    });
  });

  btnSimulateOrder.addEventListener('click', () => {
    window.handleBuyNow(1, btnSimulateOrder);
  });

  btnTestDiscount.addEventListener('click', async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/discount');
      const rtt = Math.round(performance.now() - start);
      const data = await res.json();
      showToast({
        title: 'Discount Rules Evaluated',
        message: `Promo: ${data.appliedPromo} (60% Off Rule Matrix)`,
        meta: `Node: ${data.hostname} | Compute: ${data.computeTimeMs}ms | RTT: ${rtt}ms`
      });
    } catch (e) {
      showToast({ title: 'Discount API Error', message: e.message, isError: true });
    }
  });

  btnTestHealth.addEventListener('click', async () => {
    const start = performance.now();
    try {
      const res = await fetch('/health');
      const rtt = Math.round(performance.now() - start);
      const data = await res.json();
      showToast({
        title: 'GCP Health Check: 200 OK',
        message: `Status: ${data.status} | Uptime: ${data.uptimeSeconds}s`,
        meta: `Host: ${data.hostname} | Probe Latency: ${rtt}ms`
      });
    } catch (e) {
      showToast({ title: 'Health Check Failed', message: e.message, isError: true });
    }
  });

  // Initial Bootstrapping
  initCountdown();
  fetchServerTelemetry();
  fetchProducts();

  // Periodically refresh telemetry every 10 seconds to keep live during demo
  setInterval(fetchServerTelemetry, 10000);
});

