"""
TuneOS: Operating System CPU Scheduling Algorithms
--------------------------------------------------
Simulates core operating system process scheduling algorithms:
1. FCFS (First-Come, First-Served) - Non-preemptive
2. SJF (Shortest Job First) - Non-preemptive
3. Priority Scheduling - Non-preemptive (lower number = higher priority)
4. Round Robin (RR) - Preemptive with configurable Time Quantum

Calculates:
- Completion Time (CT)
- Turnaround Time (TAT = CT - AT)
- Waiting Time (WT = TAT - BT)
- Average TAT & Average WT
- CPU Utilization %
- Gantt Chart Execution Intervals
"""

from typing import List, Dict, Any

def simulate_scheduling(
    algorithm: str,
    jobs_input: List[Dict[str, Any]],
    quantum: int = 2
) -> Dict[str, Any]:
    n = len(jobs_input)
    if n == 0:
        return {
            "algorithm": algorithm,
            "timeline": [],
            "processes": [],
            "avg_waiting_time": 0.0,
            "avg_turnaround_time": 0.0,
            "cpu_utilization": 100.0,
            "throughput": 0.0
        }

    jobs = [
        {
            "pid": str(j.get("pid", f"P{idx+1}")),
            "process_name": str(j.get("process_name", f"Task {idx+1}")),
            "arrival_time": int(j.get("arrival_time", 0)),
            "burst_time": int(j.get("burst_time", 1)),
            "priority": int(j.get("priority", 1))
        }
        for idx, j in enumerate(jobs_input)
    ]

    timeline = []
    processes_result = []

    if algorithm == "FCFS":
        # Sort by arrival time
        sorted_jobs = sorted(jobs, key=lambda x: x["arrival_time"])
        current_time = 0

        for p in sorted_jobs:
            if current_time < p["arrival_time"]:
                current_time = p["arrival_time"]
            start_time = current_time
            completion_time = start_time + p["burst_time"]
            
            timeline.append({
                "pid": p["pid"],
                "process_name": p["process_name"],
                "start_time": start_time,
                "end_time": completion_time
            })

            tat = completion_time - p["arrival_time"]
            wt = tat - p["burst_time"]
            processes_result.append({
                **p,
                "start_time": start_time,
                "completion_time": completion_time,
                "turnaround_time": tat,
                "waiting_time": wt
            })
            current_time = completion_time

    elif algorithm == "SJF":
        # Shortest Job First (Non-preemptive)
        current_time = 0
        completed = []
        remaining = jobs.copy()

        while remaining:
            ready = [p for p in remaining if p["arrival_time"] <= current_time]
            if not ready:
                current_time = min(p["arrival_time"] for p in remaining)
                continue

            ready.sort(key=lambda x: x["burst_time"])
            next_job = ready[0]
            start_time = current_time
            completion_time = start_time + next_job["burst_time"]

            timeline.append({
                "pid": next_job["pid"],
                "process_name": next_job["process_name"],
                "start_time": start_time,
                "end_time": completion_time
            })

            tat = completion_time - next_job["arrival_time"]
            wt = tat - next_job["burst_time"]
            completed.append({
                **next_job,
                "start_time": start_time,
                "completion_time": completion_time,
                "turnaround_time": tat,
                "waiting_time": wt
            })

            current_time = completion_time
            remaining.remove(next_job)

        processes_result = completed

    elif algorithm == "Priority":
        # Priority Scheduling (Lower number = higher priority)
        current_time = 0
        completed = []
        remaining = jobs.copy()

        while remaining:
            ready = [p for p in remaining if p["arrival_time"] <= current_time]
            if not ready:
                current_time = min(p["arrival_time"] for p in remaining)
                continue

            ready.sort(key=lambda x: (x["priority"], x["arrival_time"]))
            next_job = ready[0]
            start_time = current_time
            completion_time = start_time + next_job["burst_time"]

            timeline.append({
                "pid": next_job["pid"],
                "process_name": next_job["process_name"],
                "start_time": start_time,
                "end_time": completion_time
            })

            tat = completion_time - next_job["arrival_time"]
            wt = tat - next_job["burst_time"]
            completed.append({
                **next_job,
                "start_time": start_time,
                "completion_time": completion_time,
                "turnaround_time": tat,
                "waiting_time": wt
            })

            current_time = completion_time
            remaining.remove(next_job)

        processes_result = completed

    elif algorithm == "RoundRobin":
        # Preemptive Round Robin
        tq = max(1, quantum)
        remaining_burst = {p["pid"]: p["burst_time"] for p in jobs}
        first_start = {}
        completion_times = {}

        queue = []
        arrived_pids = set()
        current_time = 0

        sorted_by_arrival = sorted(jobs, key=lambda x: x["arrival_time"])

        def check_arrivals(time_val):
            for p in sorted_by_arrival:
                if p["arrival_time"] <= time_val and p["pid"] not in arrived_pids:
                    queue.append(p)
                    arrived_pids.add(p["pid"])

        check_arrivals(current_time)

        while queue or len(arrived_pids) < len(jobs):
            if not queue:
                unarrived = [p for p in jobs if p["pid"] not in arrived_pids]
                current_time = min(p["arrival_time"] for p in unarrived)
                check_arrivals(current_time)
                continue

            curr = queue.pop(0)
            rem = remaining_burst[curr["pid"]]
            exec_time = min(tq, rem)
            start_time = current_time
            end_time = start_time + exec_time

            if curr["pid"] not in first_start:
                first_start[curr["pid"]] = start_time

            timeline.append({
                "pid": curr["pid"],
                "process_name": curr["process_name"],
                "start_time": start_time,
                "end_time": end_time
            })

            current_time = end_time
            remaining_burst[curr["pid"]] -= exec_time

            # Enqueue any jobs that arrived while executing
            check_arrivals(current_time)

            if remaining_burst[curr["pid"]] > 0:
                queue.append(curr)
            else:
                completion_times[curr["pid"]] = current_time

        for p in jobs:
            ct = completion_times.get(p["pid"], 0)
            st = first_start.get(p["pid"], 0)
            tat = ct - p["arrival_time"]
            wt = tat - p["burst_time"]
            processes_result.append({
                **p,
                "start_time": st,
                "completion_time": ct,
                "turnaround_time": tat,
                "waiting_time": wt
            })

    total_tat = sum(p["turnaround_time"] for p in processes_result)
    total_wt = sum(p["waiting_time"] for p in processes_result)
    last_end = timeline[-1]["end_time"] if timeline else 1
    total_burst = sum(p["burst_time"] for p in jobs)

    return {
        "algorithm": algorithm,
        "timeline": timeline,
        "processes": processes_result,
        "avg_waiting_time": round(total_wt / n, 2),
        "avg_turnaround_time": round(total_tat / n, 2),
        "cpu_utilization": round(min(100.0, (total_burst / last_end) * 100.0), 1),
        "throughput": round(n / last_end, 3)
    }
