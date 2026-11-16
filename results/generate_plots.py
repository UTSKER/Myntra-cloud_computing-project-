"""
generate_plots.py
Generates publication-quality charts for the Cloud Computing Case Study:
1. MANDATORY: Response Time (Latency) vs. Instance Count (Course Deliverable)
2. Throughput & Error Rate vs. Instance Count
3. Autoscaling Dynamics Timeline (VUs, CPU %, Active Replicas over 34 mins)
4. 24-Hour Economic Cost Breakdown (Fixed vs. Elastic Provisioning)
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

# Set high-level styling parameters
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#cbd5e1'
plt.rcParams['axes.linewidth'] = 1.2

def plot_response_time_vs_instance_count():
    """
    Mandatory Course Deliverable:
    'Deploy a small web app behind a load balancer with autoscaling,
     run a load test, and plot response time against instance count.'
    """
    json_path = os.path.join(BASE_DIR, "experiment-2-horizontal", "horizontal-scaling-results.json")
    with open(json_path, "r") as f:
        data = json.load(f)["results"]
        
    instances = [r["instance_count"] for r in data]
    avg_lat = [r["latency_ms"]["avg"] for r in data]
    p50_lat = [r["latency_ms"]["p50_median"] for r in data]
    p95_lat = [r["latency_ms"]["p95"] for r in data]
    p99_lat = [r["latency_ms"]["p99"] for r in data]
    
    fig, ax = plt.subplots(figsize=(9, 6), dpi=300)
    
    # Grid
    ax.grid(True, linestyle='--', alpha=0.5, color='#94a3b8')
    
    # Plot lines with distinct markers
    ax.plot(instances, p99_lat, marker='s', markersize=8, color='#dc2626', linewidth=2.5, label='p99 Worst-Case Latency')
    ax.plot(instances, p95_lat, marker='^', markersize=8, color='#ea580c', linewidth=2.5, label='p95 Tail Latency')
    ax.plot(instances, avg_lat, marker='o', markersize=8, color='#0284c7', linewidth=2.5, label='Average Response Time')
    ax.plot(instances, p50_lat, marker='D', markersize=8, color='#16a34a', linewidth=2.5, label='p50 Median Latency')
    
    # Direct data labels
    for i, inst in enumerate(instances):
        ax.annotate(f"{p99_lat[i]:.1f} ms", (inst, p99_lat[i]), textcoords="offset points", xytext=(0, 10), ha='center', fontweight='bold', color='#dc2626', fontsize=9)
        ax.annotate(f"{p95_lat[i]:.1f} ms", (inst, p95_lat[i]), textcoords="offset points", xytext=(0, 10), ha='center', fontweight='bold', color='#ea580c', fontsize=9)
        ax.annotate(f"{avg_lat[i]:.1f} ms", (inst, avg_lat[i]), textcoords="offset points", xytext=(0, -16), ha='center', fontweight='bold', color='#0284c7', fontsize=9)
        ax.annotate(f"{p50_lat[i]:.1f} ms", (inst, p50_lat[i]), textcoords="offset points", xytext=(0, -16), ha='center', fontweight='bold', color='#16a34a', fontsize=9)

    ax.set_title("Response Time (Latency) vs. Instance Count\nMyntraFlash Microservice on GCP asia-south1 (100 VUs)", fontsize=13, fontweight='bold', pad=15, color='#0f172a')
    ax.set_xlabel("GCE Managed Instance Group Capacity (VM Instances)", fontsize=11, fontweight='bold', labelpad=10, color='#1e293b')
    ax.set_ylabel("Response Latency (Milliseconds)", fontsize=11, fontweight='bold', labelpad=10, color='#1e293b')
    ax.set_xticks(instances)
    ax.set_xticklabels(['1 Instance\n(e2-medium)', '2 Instances\n(2x e2-medium)', '3 Instances\n(3x e2-medium)'], fontsize=10)
    ax.set_ylim(0, 1100)
    
    # SLA threshold line
    ax.axhline(400, color='#64748b', linestyle=':', linewidth=1.8, alpha=0.8, label='Target Latency Threshold (400 ms)')
    
    ax.legend(loc='upper right', frameon=True, framealpha=0.9, facecolor='#ffffff', edgecolor='#cbd5e1', fontsize=9)
    plt.tight_layout()
    
    output_path = os.path.join(PLOTS_DIR, "response_time_vs_instance_count.png")
    plt.savefig(output_path, dpi=300)
    plt.close()
    print(f"Generated: {output_path}")

def plot_throughput_and_errors():
    """Plots Throughput (RPS) and Error Rate (%) vs Instance Count."""
    json_path = os.path.join(BASE_DIR, "experiment-2-horizontal", "horizontal-scaling-results.json")
    with open(json_path, "r") as f:
        data = json.load(f)["results"]
        
    instances = [r["instance_count"] for r in data]
    throughput = [r["throughput_rps"] for r in data]
    error_rates = [r["error_rate_pct"] for r in data]
    
    fig, ax1 = plt.subplots(figsize=(9, 6), dpi=300)
    
    # Axis 1: Throughput (Bar chart)
    x = np.array(instances)
    width = 0.35
    bars = ax1.bar(x - width/2, throughput, width, label='Throughput (Requests/sec)', color='#3b82f6', edgecolor='#1d4ed8', alpha=0.9)
    ax1.set_xlabel("Cluster Capacity (GCE e2-medium Instances)", fontsize=11, fontweight='bold', labelpad=10, color='#1e293b')
    ax1.set_ylabel("System Throughput (Requests per Second)", fontsize=11, fontweight='bold', color='#1d4ed8', labelpad=10)
    ax1.set_ylim(0, 950)
    ax1.set_xticks(instances)
    ax1.set_xticklabels(['1 Instance', '2 Instances', '3 Instances'], fontsize=10)
    ax1.grid(True, linestyle='--', alpha=0.3, axis='y')
    
    # Annotate bars
    for bar in bars:
        h = bar.get_height()
        ax1.annotate(f"{h:.1f} RPS", xy=(bar.get_x() + bar.get_width() / 2, h),
                     xytext=(0, 4), textcoords="offset points", ha='center', va='bottom', fontweight='bold', color='#1e3a8a')

    # Axis 2: Error Rate (Line plot)
    ax2 = ax1.twinx()
    line = ax2.plot(x + width/2, error_rates, color='#ef4444', marker='o', markersize=9, linewidth=2.5, label='HTTP Error Rate (%)')
    ax2.set_ylabel("HTTP Error Rate (%)", fontsize=11, fontweight='bold', color='#b91c1c', labelpad=10)
    ax2.set_ylim(-0.2, 4.0)
    
    # Annotate error points
    for i, err in enumerate(error_rates):
        ax2.annotate(f"{err:.2f}%", xy=(x[i] + width/2, err),
                     xytext=(0, 8), textcoords="offset points", ha='center', fontweight='bold', color='#b91c1c')

    plt.title("System Throughput Scaling vs. HTTP Error Rate Reduction\nGoogle Cloud External Load Balancer with MIG", fontsize=13, fontweight='bold', pad=15)
    
    # Combined legend
    handles1, labels1 = ax1.get_legend_handles_labels()
    handles2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(handles1 + handles2, labels1 + labels2, loc='upper left', frameon=True, facecolor='#ffffff')
    
    plt.tight_layout()
    output_path = os.path.join(PLOTS_DIR, "throughput_and_error_rate_vs_instance_count.png")
    plt.savefig(output_path, dpi=300)
    plt.close()
    print(f"Generated: {output_path}")

def plot_autoscaling_timeline():
    """Plots the 34-minute dynamic flash-sale surge showing VUs, CPU %, and active VM instances."""
    json_path = os.path.join(BASE_DIR, "experiment-3-autoscaling", "autoscale-timeline.json")
    with open(json_path, "r") as f:
        timeline = json.load(f)
        
    minutes = [d["minute"] for d in timeline]
    vus = [d["target_vu"] for d in timeline]
    cpu = [d["fleet_cpu_pct"] for d in timeline]
    vms = [d["active_vms"] for d in timeline]
    
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(11, 7), dpi=300, sharex=True, gridspec_kw={'height_ratios': [2, 1]})
    
    # Subplot 1: Virtual Users & CPU Utilization
    ax1.plot(minutes, vus, color='#8b5cf6', marker='o', linewidth=2.2, label='Client Load (Virtual Users - VUs)')
    ax1.set_ylabel("Virtual Users (VUs)", fontsize=10, fontweight='bold', color='#6d28d9')
    ax1.grid(True, linestyle='--', alpha=0.4)
    ax1.set_ylim(0, 550)
    
    ax1_cpu = ax1.twinx()
    ax1_cpu.plot(minutes, cpu, color='#f59e0b', marker='^', linewidth=2.2, linestyle='--', label='Fleet CPU Utilization (%)')
    ax1_cpu.axhline(70, color='#dc2626', linestyle=':', linewidth=1.8, label='Scale-Out Target Threshold (70%)')
    ax1_cpu.set_ylabel("Fleet Average CPU (%)", fontsize=10, fontweight='bold', color='#b45309')
    ax1_cpu.set_ylim(0, 100)
    
    # Combine legend for Subplot 1
    h1, l1 = ax1.get_legend_handles_labels()
    h2, l2 = ax1_cpu.get_legend_handles_labels()
    ax1.legend(h1 + h2, l1 + l2, loc='upper left', fontsize=8.5, frameon=True, facecolor='#ffffff')
    ax1.set_title("Experiment 3: Reactive MIG Autoscaling Dynamics & Hysteresis Timeline\nSimulated Myntra EORS Flash Surge (34-Minute Execution Window)", fontsize=12, fontweight='bold', pad=12)

    # Subplot 2: Active Instance Count (Step function)
    ax2.step(minutes, vms, where='post', color='#0284c7', linewidth=2.8, label='Active GCE Instances (MIG Capacity)')
    ax2.set_ylabel("VM Replicas", fontsize=10, fontweight='bold', color='#0369a1')
    ax2.set_xlabel("Experiment Timeline Elapsed Time (Minutes)", fontsize=10, fontweight='bold', labelpad=8)
    ax2.set_yticks([1, 2, 3])
    ax2.set_yticklabels(['1 VM', '2 VMs', '3 VMs'])
    ax2.set_ylim(0.5, 3.5)
    ax2.grid(True, linestyle='--', alpha=0.4)
    
    # Annotate scale events
    ax2.annotate('Scale-Out (1 -> 2 VMs)\nCPU > 70% breached', xy=(9, 2), xytext=(4, 2.5),
                 arrowprops=dict(arrowstyle="->", color="#0f172a", lw=1.2), fontsize=8.5, fontweight='bold')
    ax2.annotate('Scale-Out (2 -> 3 VMs)\nFlash Spike 500 VUs', xy=(19, 3), xytext=(14, 3.1),
                 arrowprops=dict(arrowstyle="->", color="#0f172a", lw=1.2), fontsize=8.5, fontweight='bold')
    ax2.annotate('Scale-In (3 -> 2 VMs)\nCooldown (300s) satisfied', xy=(29, 2), xytext=(22, 1.4),
                 arrowprops=dict(arrowstyle="->", color="#0f172a", lw=1.2), fontsize=8.5, fontweight='bold')

    ax2.legend(loc='lower right', fontsize=8.5, frameon=True, facecolor='#ffffff')
    
    plt.tight_layout()
    output_path = os.path.join(PLOTS_DIR, "autoscaling_timeline.png")
    plt.savefig(output_path, dpi=300)
    plt.close()
    print(f"Generated: {output_path}")

def plot_cost_comparison():
    """Plots 24-Hour & 30-Day Cost Breakdown comparing Fixed 3-VM Cluster vs Elastic MIG."""
    json_path = os.path.join(BASE_DIR, "experiment-5-cost", "cost-breakdown.json")
    with open(json_path, "r") as f:
        data = json.load(f)["comparison"]
        
    fixed = data["architecture_a_fixed_3_vms"]
    elastic = data["architecture_b_elastic_mig"]
    
    categories = ['GCE Compute\n(e2-medium)', 'Persistent Disk\n(Storage)', 'Cloud Load\nBalancing', 'Network Data\nTransfer', 'Total 24h\nExpenditure']
    fixed_vals = [fixed["compute_cost_usd"], fixed["storage_cost_usd"], fixed["load_balancer_cost_usd"], fixed["data_transfer_50gb_usd"], fixed["total_24hr_cost_usd"]]
    elastic_vals = [elastic["compute_cost_usd"], elastic["storage_cost_usd"], elastic["load_balancer_cost_usd"], elastic["data_transfer_50gb_usd"], elastic["total_24hr_cost_usd"]]
    
    x = np.arange(len(categories))
    width = 0.35
    
    fig, ax = plt.subplots(figsize=(9, 5.5), dpi=300)
    
    bars1 = ax.bar(x - width/2, fixed_vals, width, label='Architecture A: Fixed 3-VM Cluster', color='#ef4444', alpha=0.85, edgecolor='#b91c1c')
    bars2 = ax.bar(x + width/2, elastic_vals, width, label='Architecture B: Elastic 1–3 VM MIG', color='#10b981', alpha=0.85, edgecolor='#047857')
    
    ax.set_ylabel("Cost in USD ($)", fontsize=11, fontweight='bold', color='#1e293b', labelpad=10)
    ax.set_title("24-Hour Diurnal Cloud Cost Comparison on GCP asia-south1\nFixed Peak Provisioning vs. Elastic Autoscaling (41.8% Net Cost Savings)", fontsize=12, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontsize=9.5)
    ax.set_ylim(0, 4.2)
    ax.grid(True, linestyle='--', alpha=0.4, axis='y')
    
    for bar in bars1:
        h = bar.get_height()
        ax.annotate(f"${h:.2f}", xy=(bar.get_x() + bar.get_width() / 2, h),
                    xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#7f1d1d')
                    
    for bar in bars2:
        h = bar.get_height()
        ax.annotate(f"${h:.2f}", xy=(bar.get_x() + bar.get_width() / 2, h),
                    xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#064e3b')

    # Add text banner highlighting savings
    ax.text(0.5, 0.88, "Net 24-Hour Operational Cost Savings: 41.8% (42.0 VM-Hours Eliminated)\nProjected Monthly Savings: ₹3,697 INR ($44.28 USD)",
            transform=ax.transAxes, fontsize=9.5, fontweight='bold', ha='center', va='center',
            bbox=dict(boxstyle="round,pad=0.5", facecolor="#ecfdf5", edgecolor="#34d399", alpha=0.9))

    ax.legend(loc='upper right', frameon=True, facecolor='#ffffff', fontsize=9)
    plt.tight_layout()
    
    output_path = os.path.join(PLOTS_DIR, "economic_cost_comparison.png")
    plt.savefig(output_path, dpi=300)
    plt.close()
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    plot_response_time_vs_instance_count()
    plot_throughput_and_errors()
    plot_autoscaling_timeline()
    plot_cost_comparison()
    print("All 4 publication-quality plots successfully generated!")

