"""
generate_real_live_plots.py
Generates publication-quality charts incorporating the 1 LAKH (100,000 REQUESTS)
live benchmark data from http://myntra.divyesh.site on Google Cloud Platform.
"""

import os
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PLOTS_DIR = os.path.join(BASE_DIR, "plots")
LIVE_DIR = os.path.join(BASE_DIR, "live-benchmarks")
os.makedirs(PLOTS_DIR, exist_ok=True)

plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#cbd5e1'
plt.rcParams['axes.linewidth'] = 1.2

# Load real JSON benchmark results
with open(os.path.join(LIVE_DIR, "stage1-20vu-1000req.json")) as f:
    s1 = json.load(f)
with open(os.path.join(LIVE_DIR, "stage2-50vu-5000req.json")) as f:
    s2 = json.load(f)
with open(os.path.join(LIVE_DIR, "stage3-100vu-10000req.json")) as f:
    s3 = json.load(f)
with open(os.path.join(LIVE_DIR, "stage4-200vu-100000req.json")) as f:
    s4 = json.load(f)

stages = [
    "Stage 1\n(20 VUs, 1 Node)\n1k Reqs",
    "Stage 2\n(50 VUs, Saturated)\n5k Reqs",
    "Stage 3\n(100 VUs, 3 Nodes)\n10k Reqs",
    "Stage 4 (1 Lakh!)\n(200 VUs, 8 Nodes)\n100k Reqs"
]

def plot_live_response_time():
    """Plot 1: Response Time & Latency Percentiles measured live from myntra.divyesh.site."""
    p50 = [s1["latencyMs"]["p50"], s2["latencyMs"]["p50"], s3["latencyMs"]["p50"], s4["latencyMs"]["p50"]]
    p90 = [s1["latencyMs"]["p90"], s2["latencyMs"]["p90"], s3["latencyMs"]["p90"], s4["latencyMs"]["p90"]]
    p95 = [s1["latencyMs"]["p95"], s2["latencyMs"]["p95"], s3["latencyMs"]["p95"], s4["latencyMs"]["p95"]]
    p99 = [s1["latencyMs"]["p99"], s2["latencyMs"]["p99"], s3["latencyMs"]["p99"], s4["latencyMs"]["p99"]]
    avg = [s1["latencyMs"]["avg"], s2["latencyMs"]["avg"], s3["latencyMs"]["avg"], s4["latencyMs"]["avg"]]

    x = np.arange(len(stages))
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.grid(True, linestyle='--', alpha=0.5, color='#94a3b8')

    ax.plot(x, p99, marker='s', markersize=8, color='#dc2626', linewidth=2.5, label='p99 Worst-Case Latency')
    ax.plot(x, p95, marker='^', markersize=8, color='#ea580c', linewidth=2.5, label='p95 Tail Latency')
    ax.plot(x, avg, marker='o', markersize=8, color='#0284c7', linewidth=2.5, label='Average Response Time')
    ax.plot(x, p50, marker='D', markersize=8, color='#16a34a', linewidth=2.5, label='p50 Median Latency')

    for i in range(len(stages)):
        ax.annotate(f"{p99[i]:.0f} ms", (x[i], p99[i]), textcoords="offset points", xytext=(0, 8), ha='center', fontweight='bold', color='#dc2626', fontsize=8.5)
        ax.annotate(f"{p95[i]:.0f} ms", (x[i], p95[i]), textcoords="offset points", xytext=(0, -14), ha='center', fontweight='bold', color='#ea580c', fontsize=8.5)
        ax.annotate(f"{avg[i]:.0f} ms", (x[i], avg[i]), textcoords="offset points", xytext=(0, 8), ha='center', fontweight='bold', color='#0284c7', fontsize=8.5)
        ax.annotate(f"{p50[i]:.0f} ms", (x[i], p50[i]), textcoords="offset points", xytext=(0, -14), ha='center', fontweight='bold', color='#16a34a', fontsize=8.5)

    ax.set_title("Live Measured Response Latency up to 1 Lakh (100,000) Requests\nDeployed Production Endpoint: myntra.divyesh.site (GCP asia-south1)", fontsize=12, fontweight='bold', pad=14, color='#0f172a')
    ax.set_xlabel("Experimental Workload Stages & Cluster Scaling State (1 -> 8 VMs)", fontsize=10.5, fontweight='bold', labelpad=10, color='#1e293b')
    ax.set_ylabel("Response Latency (Milliseconds)", fontsize=10.5, fontweight='bold', labelpad=10, color='#1e293b')
    ax.set_xticks(x)
    ax.set_xticklabels(stages, fontsize=9)
    ax.set_ylim(0, 16500)
    ax.legend(loc='upper left', frameon=True, framealpha=0.9, facecolor='#ffffff', edgecolor='#cbd5e1', fontsize=9)
    plt.tight_layout()

    out = os.path.join(PLOTS_DIR, "response_time_vs_instance_count.png")
    plt.savefig(out, dpi=300)
    plt.close()
    print(f"Generated Live Plot 1: {out}")

def plot_live_throughput_and_errors():
    """Plot 2: Throughput (RPS) and Error Rate (%) up to 1 Lakh requests."""
    rps = [s1["throughputRps"], s2["throughputRps"], s3["throughputRps"], s4["throughputRps"]]
    err = [s1["errorPercentage"], s2["errorPercentage"], s3["errorPercentage"], s4["errorPercentage"]]

    x = np.arange(len(stages))
    width = 0.35

    fig, ax1 = plt.subplots(figsize=(10, 6), dpi=300)
    bars = ax1.bar(x - width/2, rps, width, label='Throughput (Requests/sec)', color='#3b82f6', edgecolor='#1d4ed8', alpha=0.9)
    ax1.set_xlabel("Workload Stages & Autoscaled Cluster Size", fontsize=10.5, fontweight='bold', labelpad=10, color='#1e293b')
    ax1.set_ylabel("Throughput (Requests per Second)", fontsize=10.5, fontweight='bold', color='#1d4ed8', labelpad=10)
    ax1.set_ylim(0, 220)
    ax1.set_xticks(x)
    ax1.set_xticklabels(stages, fontsize=9)
    ax1.grid(True, linestyle='--', alpha=0.3, axis='y')

    for bar in bars:
        h = bar.get_height()
        ax1.annotate(f"{h:.1f} RPS", xy=(bar.get_x() + bar.get_width() / 2, h),
                     xytext=(0, 4), textcoords="offset points", ha='center', va='bottom', fontweight='bold', color='#1e3a8a')

    ax2 = ax1.twinx()
    line = ax2.plot(x + width/2, err, color='#ef4444', marker='o', markersize=9, linewidth=2.5, label='HTTP Error Rate (%)')
    ax2.set_ylabel("HTTP Error Rate (%)", fontsize=10.5, fontweight='bold', color='#b91c1c', labelpad=10)
    ax2.set_ylim(-1, 20)

    for i, e in enumerate(err):
        ax2.annotate(f"{e:.2f}%", xy=(x[i] + width/2, e),
                     xytext=(0, 8), textcoords="offset points", ha='center', fontweight='bold', color='#b91c1c')

    plt.title("Live Throughput Scaling (30.7 -> 181.1 RPS) & Error Rate Containment (0.33%)\nEmpirically Measured across 100,000+ Requests on myntra.divyesh.site", fontsize=11.5, fontweight='bold', pad=14)
    h1, l1 = ax1.get_legend_handles_labels()
    h2, l2 = ax2.get_legend_handles_labels()
    ax1.legend(h1 + h2, l1 + l2, loc='upper left', frameon=True, facecolor='#ffffff')
    plt.tight_layout()

    out = os.path.join(PLOTS_DIR, "throughput_and_error_rate_vs_instance_count.png")
    plt.savefig(out, dpi=300)
    plt.close()
    print(f"Generated Live Plot 2: {out}")

def plot_live_8node_distribution():
    """Plot 3: 1 Lakh Request Distribution across all 8 autoscaled Google Cloud VMs."""
    dist = s4["nodeDistribution"]
    labels = [f"Instance [{node[:8]}...]\n{count:,} reqs" for node, count in dist.items()]
    counts = list(dist.values())
    colors_list = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316']

    fig, ax = plt.subplots(figsize=(9, 6.5), dpi=300)
    wedges, texts, autotexts = ax.pie(
        counts, labels=labels, autopct='%1.1f%%',
        startangle=140, colors=colors_list, explode=[0.03]*len(counts),
        textprops=dict(color="#1e293b", fontweight='bold', fontsize=8.5)
    )
    for at in autotexts:
        at.set_color('white')
        at.set_fontsize(9.5)
        at.set_weight('bold')

    ax.set_title("1 LAKH (100,000 REQUESTS) Empirical Load Balancer Distribution\nEquitable Distribution across 8 Autoscaled GCE Nodes on myntra.divyesh.site", fontsize=11, fontweight='bold', pad=15)
    plt.tight_layout()

    out = os.path.join(PLOTS_DIR, "live_load_distribution_pie.png")
    plt.savefig(out, dpi=300)
    plt.close()
    print(f"Generated Live Plot 3: {out}")

if __name__ == "__main__":
    plot_live_response_time()
    plot_live_throughput_and_errors()
    plot_live_8node_distribution()
    print("All live empirical plots (1 Lakh scale) generated successfully!")
