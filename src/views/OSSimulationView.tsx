import React, { useState, useEffect } from 'react';
import { Cpu, Play, Plus, Trash2, RotateCcw, BarChart3, HelpCircle, Layers, Check } from 'lucide-react';
import { ProcessJob, SchedulingResult } from '../types.ts';
import { api } from '../services/api.ts';

// Realistic audio pipeline presets to bridge OS scheduling with music streaming
const AUDIO_PIPELINE_PRESET: ProcessJob[] = [
  { pid: 'P1', process_name: 'Audio Stream Buffer (Real-time)', arrival_time: 0, burst_time: 4, priority: 1 },
  { pid: 'P2', process_name: 'FLAC / MP3 Decoders (Worker 1)', arrival_time: 1, burst_time: 6, priority: 2 },
  { pid: 'P3', process_name: 'Recommendation Vector Matrix', arrival_time: 2, burst_time: 8, priority: 3 },
  { pid: 'P4', process_name: 'Cover Art Transcoder (IO Bound)', arrival_time: 3, burst_time: 2, priority: 4 },
  { pid: 'P5', process_name: 'User Play-Count Logger (DB sync)', arrival_time: 4, burst_time: 3, priority: 2 },
];

const SIMPLE_STUDENT_PRESET: ProcessJob[] = [
  { pid: 'P1', process_name: 'Process 1', arrival_time: 0, burst_time: 5, priority: 3 },
  { pid: 'P2', process_name: 'Process 2', arrival_time: 1, burst_time: 3, priority: 1 },
  { pid: 'P3', process_name: 'Process 3', arrival_time: 2, burst_time: 8, priority: 4 },
  { pid: 'P4', process_name: 'Process 4', arrival_time: 3, burst_time: 6, priority: 2 },
];

export const OSSimulationView: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'FCFS' | 'SJF' | 'Priority' | 'RoundRobin'>('RoundRobin');
  const [quantum, setQuantum] = useState<number>(2);
  const [jobs, setJobs] = useState<ProcessJob[]>(AUDIO_PIPELINE_PRESET);
  const [result, setResult] = useState<SchedulingResult | null>(null);
  const [loading, setLoading] = useState(false);

  // New process input state
  const [newPid, setNewPid] = useState('');
  const [newName, setNewName] = useState('');
  const [newArrival, setNewArrival] = useState(0);
  const [newBurst, setNewBurst] = useState(4);
  const [newPriority, setNewPriority] = useState(1);

  const runSimulation = async () => {
    try {
      setLoading(true);
      const res = await api.simulateOS(algorithm, jobs, quantum);
      setResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [algorithm, quantum, jobs]);

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    const pid = newPid.trim() || `P${jobs.length + 1}`;
    const pName = newName.trim() || `Job ${pid}`;
    const newJob: ProcessJob = {
      pid,
      process_name: pName,
      arrival_time: Number(newArrival) || 0,
      burst_time: Math.max(1, Number(newBurst) || 1),
      priority: Math.max(1, Number(newPriority) || 1),
    };
    setJobs(prev => [...prev, newJob]);
    setNewPid('');
    setNewName('');
    setNewArrival(0);
    setNewBurst(4);
    setNewPriority(1);
  };

  const handleRemoveJob = (pid: string) => {
    setJobs(prev => prev.filter(j => j.pid !== pid));
  };

  const handleLoadPreset = (preset: ProcessJob[]) => {
    setJobs(preset);
  };

  // Color generator for Gantt chart blocks
  const jobColors = [
    'bg-emerald-500/90 text-black border-emerald-400',
    'bg-cyan-500/90 text-black border-cyan-400',
    'bg-indigo-500/90 text-white border-indigo-400',
    'bg-amber-500/90 text-black border-amber-400',
    'bg-rose-500/90 text-white border-rose-400',
    'bg-purple-500/90 text-white border-purple-400',
    'bg-teal-500/90 text-black border-teal-400',
  ];

  const getJobColor = (pid: string) => {
    const idx = jobs.findIndex(j => j.pid === pid);
    return jobColors[(idx >= 0 ? idx : 0) % jobColors.length];
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Cpu className="w-4 h-4" />
            <span>Academic OS Laboratory Simulation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            CPU Process Scheduling Simulator
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Demonstrates how operating systems schedule real-time audio playback buffers and recommendation computations
          </p>
        </div>

        {/* Algorithm Segmented Selector */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg self-start sm:self-auto">
          {(['FCFS', 'SJF', 'Priority', 'RoundRobin'] as const).map(alg => (
            <button
              key={alg}
              type="button"
              onClick={() => setAlgorithm(alg)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                algorithm === alg
                  ? 'bg-emerald-500 text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {alg === 'RoundRobin' ? 'Round Robin (RR)' : alg}
            </button>
          ))}
        </div>
      </div>

      {/* Preset work loaders & quantum control */}
      <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">Load Preset Workloads:</span>
          <button
            type="button"
            onClick={() => handleLoadPreset(AUDIO_PIPELINE_PRESET)}
            className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors"
          >
            Audio Engine Pipeline
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset(SIMPLE_STUDENT_PRESET)}
            className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors"
          >
            Classic 4-Process Exam Preset
          </button>
        </div>

        {algorithm === 'RoundRobin' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-300 font-medium">Time Quantum (q):</label>
            <input
              type="number"
              min={1}
              max={10}
              value={quantum}
              onChange={e => setQuantum(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-16 px-2.5 py-1 text-xs font-mono bg-zinc-950 border border-zinc-700 rounded-lg text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs text-zinc-500">time units</span>
          </div>
        )}
      </div>

      {/* Gantt Chart Timeline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Execution Timeline (Gantt Chart)
          </h2>
          <span className="text-[11px] text-zinc-500 font-mono">
            {algorithm} Scheduling · Time Span:{' '}
            {result?.timeline.length ? result.timeline[result.timeline.length - 1].end_time : 0} units
          </span>
        </div>

        {result && result.timeline.length > 0 ? (
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 overflow-x-auto">
            {/* Blocks Row */}
            <div className="flex items-center min-w-[600px] h-14 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
              {result.timeline.map((block, idx) => {
                const totalUnits = result.timeline[result.timeline.length - 1].end_time || 1;
                const widthPercent = ((block.end_time - block.start_time) / totalUnits) * 100;
                const colorClass = getJobColor(block.pid);

                return (
                  <div
                    key={idx}
                    style={{ width: `${Math.max(5, widthPercent)}%` }}
                    className={`h-full border-r ${colorClass} flex flex-col items-center justify-center p-1 relative group cursor-default transition-transform`}
                    title={`${block.process_name} (${block.pid}) | Time: [${block.start_time} - ${block.end_time}]`}
                  >
                    <span className="text-xs font-bold truncate max-w-full px-1">
                      {block.pid}
                    </span>
                    <span className="text-[9px] font-mono opacity-80">
                      {block.end_time - block.start_time}u
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time Ticks */}
            <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-zinc-500 pt-2 px-1">
              <span>0</span>
              {result.timeline.map((b, i) => (
                <span key={i} className="text-right">
                  {b.end_time}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-zinc-500">No active timeline data</div>
        )}
      </section>

      {/* Quantitative Summary KPI Metrics */}
      {result && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-xs text-zinc-400">Average Turnaround Time</span>
            <p className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
              {result.avg_turnaround_time}
              <span className="text-xs font-normal text-zinc-500 ml-1">units</span>
            </p>
            <span className="text-[10px] text-zinc-500 mt-0.5 block">TAT = Completion - Arrival</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-xs text-zinc-400">Average Waiting Time</span>
            <p className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
              {result.avg_waiting_time}
              <span className="text-xs font-normal text-zinc-500 ml-1">units</span>
            </p>
            <span className="text-[10px] text-zinc-500 mt-0.5 block">WT = Turnaround - Burst</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-xs text-zinc-400">CPU Utilization</span>
            <p className="text-2xl font-bold font-mono tabular-nums text-cyan-400 mt-1">
              {result.cpu_utilization}%
            </p>
            <span className="text-[10px] text-zinc-500 mt-0.5 block">Active Time / Total Time</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-xs text-zinc-400">System Throughput</span>
            <p className="text-2xl font-bold font-mono tabular-nums text-cyan-400 mt-1">
              {result.throughput}
              <span className="text-xs font-normal text-zinc-500 ml-1">proc/unit</span>
            </p>
            <span className="text-[10px] text-zinc-500 mt-0.5 block">Completed Tasks / Span</span>
          </div>
        </section>
      )}

      {/* Calculated Results Table */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Calculated Process Metrics</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-4 py-3">PID</th>
                  <th className="px-4 py-3">Process Name</th>
                  <th className="px-4 py-3 font-mono">Arrival (AT)</th>
                  <th className="px-4 py-3 font-mono">Burst (BT)</th>
                  <th className="px-4 py-3 font-mono">Priority</th>
                  <th className="px-4 py-3 font-mono">Completion (CT)</th>
                  <th className="px-4 py-3 font-mono text-emerald-400">Turnaround (TAT)</th>
                  <th className="px-4 py-3 font-mono text-emerald-400">Waiting (WT)</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {result?.processes.map(p => (
                  <tr key={p.pid} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white font-mono">{p.pid}</td>
                    <td className="px-4 py-3 font-medium text-zinc-300">{p.process_name}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-zinc-400">{p.arrival_time}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-zinc-400">{p.burst_time}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-zinc-400">{p.priority}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-zinc-300">{p.completion_time}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-emerald-400 font-semibold">
                      {p.turnaround_time}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-emerald-400 font-semibold">
                      {p.waiting_time}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemoveJob(p.pid)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                        title="Remove process"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Custom Process Entry Form */}
      <section className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-white">Add Custom Process to Queue</h3>
        <form onSubmit={handleAddJob} className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">PID</label>
            <input
              type="text"
              placeholder={`P${jobs.length + 1}`}
              value={newPid}
              onChange={e => setNewPid(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="col-span-2 sm:col-span-2">
            <label className="block text-[11px] text-zinc-400 mb-1">Task Description</label>
            <input
              type="text"
              placeholder="e.g. Sitar Waveform Analyzer"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Arrival Time</label>
            <input
              type="number"
              min={0}
              value={newArrival}
              onChange={e => setNewArrival(parseInt(e.target.value, 10) || 0)}
              className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Burst Time</label>
            <input
              type="number"
              min={1}
              value={newBurst}
              onChange={e => setNewBurst(parseInt(e.target.value, 10) || 1)}
              className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Priority (1=High)</label>
            <input
              type="number"
              min={1}
              value={newPriority}
              onChange={e => setNewPriority(parseInt(e.target.value, 10) || 1)}
              className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="col-span-2 sm:col-span-6 flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Enqueue Process
            </button>
          </div>
        </form>
      </section>

      {/* Educational Theory Card */}
      <section className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
        <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Operating System Concepts in Audio Systems
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed">
          In real-time operating systems (RTOS) and multimedia servers, audio stream decoding requires highest priority (Priority 1) or Round Robin time slicing to ensure buffers never empty (preventing audio underruns or stuttering). Computationally heavy background tasks like user recommendation vector dot-products run at lower priorities so streaming playback remains completely smooth and uninterrupted.
        </p>
      </section>
    </div>
  );
};
