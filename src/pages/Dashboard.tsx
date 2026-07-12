import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Zap, ShieldAlert, Wifi, Globe, HardDrive, Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

interface Metrics {
  cpu: number;
  memory: number;
  disk: number;
  bandwidth: { up: number; down: number };
  online_users: number;
  ping: number;
  jitter: number;
  packet_loss: number;
  uptime: number;
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    cpu: 0, memory: 0, disk: 0, bandwidth: { up: 0, down: 0 },
    online_users: 0, ping: 0, jitter: 0, packet_loss: 0, uptime: 0
  });
  
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'metrics') {
        setMetrics(msg.data);
        setChartData(prev => {
          const newData = [...prev, {
            time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            up: msg.data.bandwidth.up,
            down: msg.data.bandwidth.down,
          }];
          if (newData.length > 20) newData.shift();
          return newData;
        });
      }
    };

    return () => ws.close();
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const stats = [
    { name: 'Online Users', value: metrics.online_users.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Active Nodes', value: '3', icon: Globe, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { name: 'Avg Ping', value: `${metrics.ping} ms`, icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
    { name: 'Packet Loss', value: `${metrics.packet_loss.toFixed(1)}%`, icon: ShieldAlert, color: metrics.packet_loss > 1 ? 'text-red-400' : 'text-emerald-400', bg: metrics.packet_loss > 1 ? 'bg-red-400/10' : 'bg-emerald-400/10' },
  ];

  const system = [
    { name: 'CPU Usage', value: metrics.cpu, icon: Cpu, color: 'text-blue-400' },
    { name: 'Memory', value: metrics.memory, icon: HardDrive, color: 'text-indigo-400' },
    { name: 'Disk Storage', value: metrics.disk, icon: HardDrive, color: 'text-emerald-400' },
  ];

  const railwayRegion = 'eu-west'; // Placeholder for railway region logic

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time enterprise monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full border border-blue-500/30">
            <span className="text-xs font-medium text-blue-400">Region: {railwayRegion.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-400">Uptime: {formatUptime(metrics.uptime)}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-5 rounded-2xl relative overflow-hidden group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.name}</p>
                <p className="text-3xl font-bold text-white mt-2 font-mono">{stat.value}</p>
              </div>
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bandwidth Chart */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-400" />
              Network Traffic
            </h2>
            <div className="flex gap-4 text-sm font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                DL: {(metrics.bandwidth.down / 1000).toFixed(1)} Mbps
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                UL: {(metrics.bandwidth.up / 1000).toFixed(1)} Mbps
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="down" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorDown)" />
                <Area type="monotone" dataKey="up" stroke="#60a5fa" strokeWidth={2} fillOpacity={1} fill="url(#colorUp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Server Resources */}
        <div className="glass-card p-5 rounded-2xl flex flex-col">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-yellow-400" />
            System Resources
          </h2>
          <div className="flex-1 flex flex-col justify-center gap-8">
            {system.map((sys) => (
              <div key={sys.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <sys.icon className={cn("w-5 h-5", sys.color)} />
                    {sys.name}
                  </div>
                  <span className="text-white font-mono">{sys.value.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sys.value}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      sys.value > 85 ? "bg-red-500" : sys.value > 70 ? "bg-yellow-500" : "bg-blue-500"
                    )}
                  />
                </div>
              </div>
            ))}

            <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Jitter</span>
                <span className="text-white font-mono">{metrics.jitter.toFixed(2)} ms</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-400">TCP Connections</span>
                <span className="text-white font-mono">{Math.floor(metrics.online_users * 3.5)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
