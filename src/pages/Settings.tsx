import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Crosshair, Globe, Shield, Zap, Smartphone, Wifi, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

export function Settings() {
  const [activeProfile, setActiveProfile] = useState('balanced');
  const [mtu, setMtu] = useState(1420);
  const [tcpBuffer, setTcpBuffer] = useState(4194304);
  const [congestion, setCongestion] = useState('bbr');

  const profiles = [
    { id: 'gaming', name: 'Gaming', desc: 'Lowest possible latency, reduced padding', icon: Crosshair, color: 'text-red-400' },
    { id: 'streaming', name: 'Streaming', desc: 'High throughput, large TCP buffer', icon: Zap, color: 'text-blue-400' },
    { id: 'balanced', name: 'Balanced', desc: 'Optimal for general usage', icon: Globe, color: 'text-emerald-400' },
    { id: 'mobile', name: 'Mobile', desc: 'Optimized for cellular networks (4G/5G)', icon: Smartphone, color: 'text-amber-400' },
    { id: 'wifi', name: 'WiFi', desc: 'Optimized for unstable WiFi', icon: Wifi, color: 'text-purple-400' },
    { id: 'security', name: 'High Security', desc: 'Maximized uTLS fingerprinting & padding', icon: Lock, color: 'text-slate-400' },
  ];

  const handleProfileSwitch = (id: string) => {
    setActiveProfile(id);
    if (id === 'gaming') {
      setMtu(1360); setTcpBuffer(1048576); setCongestion('bbr');
    } else if (id === 'streaming') {
      setMtu(1420); setTcpBuffer(8388608); setCongestion('cubic');
    } else {
      setMtu(1420); setTcpBuffer(4194304); setCongestion('bbr');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Adaptive Configuration</h1>
        <p className="text-slate-400 text-sm mt-1">Automatically tune TLS, TCP, and UDP parameters for optimal node performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleProfileSwitch(profile.id)}
            className={cn(
              "p-5 rounded-2xl border text-left transition-all duration-200 group relative overflow-hidden",
              activeProfile === profile.id 
                ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
                : "glass-card hover:bg-slate-800/40 border-slate-800/50"
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "p-2 rounded-lg",
                activeProfile === profile.id ? "bg-blue-500/20 " + profile.color : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
              )}>
                <profile.icon className="w-5 h-5" />
              </div>
              <h3 className={cn(
                "font-semibold",
                activeProfile === profile.id ? profile.color : "text-white"
              )}>{profile.name}</h3>
            </div>
            <p className="text-sm text-slate-400">{profile.desc}</p>
            {activeProfile === profile.id && (
              <motion.div layoutId="active-indicator" className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>

      <div className="glass-card p-6 rounded-2xl mt-8">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Advanced Core Tuning
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Auto MTU</label>
              <input
                type="number"
                value={mtu}
                onChange={(e) => setMtu(Number(e.target.value))}
                className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Congestion Control</label>
              <select
                value={congestion}
                onChange={(e) => setCongestion(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-mono"
              >
                <option value="bbr">BBR (Recommended)</option>
                <option value="cubic">CUBIC</option>
                <option value="reno">RENO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">uTLS Fingerprint</label>
              <select
                className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-mono"
              >
                <option value="chrome">Chrome (Default)</option>
                <option value="firefox">Firefox</option>
                <option value="safari">Safari</option>
                <option value="ios">iOS</option>
                <option value="random">Randomized</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">TCP Buffer Size (Bytes)</label>
              <input
                type="number"
                value={tcpBuffer}
                onChange={(e) => setTcpBuffer(Number(e.target.value))}
                className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">ALPN Negotiation</label>
              <input
                type="text"
                defaultValue="h2,http/1.1"
                className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <input type="checkbox" id="keepalive" defaultChecked className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500" />
              <label htmlFor="keepalive" className="text-sm font-medium text-slate-300 select-none">Auto KeepAlive</label>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <input type="checkbox" id="tcpfastopen" defaultChecked className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500" />
              <label htmlFor="tcpfastopen" className="text-sm font-medium text-slate-300 select-none">TCP Fast Open</label>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <input type="checkbox" id="happyeyeballs" defaultChecked className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500" />
              <label htmlFor="happyeyeballs" className="text-sm font-medium text-slate-300 select-none">Happy Eyeballs</label>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <input type="checkbox" id="packetpadding" className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500" />
              <label htmlFor="packetpadding" className="text-sm font-medium text-slate-300 select-none">Packet Padding</label>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <input type="checkbox" id="mux" className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500" />
              <label htmlFor="mux" className="text-sm font-medium text-slate-300 select-none">Multiplexing (Mux)</label>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <input type="checkbox" id="ipv6" defaultChecked className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500" />
              <label htmlFor="ipv6" className="text-sm font-medium text-slate-300 select-none">Prefer IPv6</label>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-end">
          <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Save className="w-5 h-5" />
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}
