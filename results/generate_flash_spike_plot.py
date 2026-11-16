"""
generate_flash_spike_plot.py
Plots the real-time, second-by-second dynamic timeline of the Live Flash Sale Spike
measured directly against http://myntra.divyesh.site on Google Cloud Platform.
"""

import os
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PLOTS_DIR = os.path.join(BASE_DIR, "plots")
os.makedirs(PLOTS_DIR, exist_ok=True)

JSON_PATH = os.path.join(BASE_DIR, "live-benchmarks", "live-flash-sale-spike.json")
with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

ts = data["timeSeries"]

sec = [x["elapsedSec"] for x in ts]
vus = [x["activeWorkers"] for x in ts]
rps = [x["rps"] for x in ts]
p50 = [x["p50Ms"] for x in ts]
p95 = [x["p95Ms"] for x in ts]
err = [x["errorPct"] for x in ts]

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), sharex=True)
fig.patch.set_facecolor('#ffffff')

# Phase Shading
for ax in (ax1, ax2):
    ax.axvspan(0, 25, color='#ecfdf5', alpha=0.6, label='Phase 1: Baseline (10 VUs)')
    ax.axvspan(25, 125, color='#fef2f2', alpha=0.6, label='Phase 2: Flash Spike (150 VUs)')
    ax.axvspan(125, 155, color='#eff6ff', alpha=0.6, label='Phase 3: Decay (10 VUs)')

# Subplot 1: Concurrency (VUs) and System Throughput (RPS)
ax1.set_facecolor('#fafafa')
color_vu = '#4f46e5'
ax1.plot(sec, vus, color=color_vu, linewidth=2.5, linestyle='--', label='Client Concurrency (VUs)')
ax1.set_ylabel('Active Workers (VUs)', color=color_vu, fontsize=11, fontweight='bold')
ax1.tick_params(axis='y', labelcolor=color_vu)
ax1.set_ylim(-10, 180)
ax1.grid(True, linestyle=':', alpha=0.5)

ax1_rps = ax1.twinx()
color_rps = '#059669'
ax1_rps.plot(sec, rps, color=color_rps, linewidth=2.2, label='System Throughput (RPS)')
ax1_rps.set_ylabel('Throughput (req/sec)', color=color_rps, fontsize=11, fontweight='bold')
ax1_rps.tick_params(axis='y', labelcolor=color_rps)
ax1_rps.set_ylim(0, max(rps) * 1.15)

# Annotation for Flash Surge
ax1.annotate('FLASH SALE OPENS!\n(15x Surge: 10 -> 150 VUs)',
             xy=(25, 150), xytext=(35, 155),
             arrowprops=dict(facecolor='#dc2626', shrink=0.08, width=2, headwidth=8),
             fontweight='bold', color='#dc2626', fontsize=9.5,
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#fee2e2', edgecolor='#dc2626'))

ax1.annotate('POST-SALE DEMAND DECAY\n(Instant Drop: 150 -> 10 VUs)',
             xy=(125, 10), xytext=(90, 50),
             arrowprops=dict(facecolor='#2563eb', shrink=0.08, width=2, headwidth=8),
             fontweight='bold', color='#2563eb', fontsize=9.5,
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#dbeafe', edgecolor='#2563eb'))

ax1.set_title('Live Dynamic Flash Sale Spike Waveform: Client Concurrency vs. Throughput & Latency\nEmpirically Measured on http://myntra.divyesh.site (GCP asia-south1 Mumbai)',
              fontsize=13, fontweight='bold', pad=12, color='#0f172a')

# Subplot 2: Response Latency & Tail Shock
ax2.set_facecolor('#fafafa')
ax2.plot(sec, p50, color='#0284c7', linewidth=2.0, marker='o', markersize=3, label='p50 Median Latency (ms)')
ax2.plot(sec, p95, color='#dc2626', linewidth=2.2, marker='s', markersize=3, label='p95 Tail Latency (ms)')
ax2.set_ylabel('Response Latency (ms)', fontsize=11, fontweight='bold', color='#0f172a')
ax2.set_xlabel('Elapsed Time (Seconds)', fontsize=11, fontweight='bold', color='#0f172a')
ax2.set_yscale('log')
ax2.set_ylim(20, 30000)
ax2.grid(True, linestyle=':', alpha=0.5)

# Annotation for Provisioning Lag
ax2.annotate('Provisioning Lag Shock Window:\nTail latency surges from 400ms to 8,100ms\nas single baseline node event loop saturates',
             xy=(45, 8000), xytext=(50, 15000),
             arrowprops=dict(facecolor='#b91c1c', shrink=0.08, width=2, headwidth=8),
             fontweight='bold', color='#b91c1c', fontsize=9,
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#fef2f2', edgecolor='#b91c1c'))

ax2.annotate('Queue Drain & Recovery:\nSub-200ms latency restored\nas traffic drops back to 10 VUs',
             xy=(140, 180), xytext=(95, 40),
             arrowprops=dict(facecolor='#059669', shrink=0.08, width=2, headwidth=8),
             fontweight='bold', color='#059669', fontsize=9,
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#ecfdf5', edgecolor='#059669'))

ax2.legend(loc='upper right', framealpha=0.9, fontsize=9.5)

plt.tight_layout()
out_png = os.path.join(PLOTS_DIR, "live_flash_sale_spike_timeline.png")
plt.savefig(out_png, dpi=300)
plt.close()

print(f"Generated Live Flash Sale Spike Timeline Plot: {out_png}")

