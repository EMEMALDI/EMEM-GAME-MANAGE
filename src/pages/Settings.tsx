import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Crosshair, Globe, Shield, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export function Settings() {
  const [activeProfile, setActiveProfile] = useState('nl');
  const [mtu, setMtu] = useState(1420);
  const [tcpBuffer, setTcpBuffer] = useState(4194304);
  const [congestion, setCongestion] = useState('bbr');

  const profiles = [
    { id: 'nl', name: 'Netherlands', desc: 'Optimized for European servers', icon: Globe },
    { id: 'tr', name: 'Turkey', desc: 'Balanced routing for MENA', icon: Crosshair },
    { id: 'ae', name: 'UAE', desc: 'Low-latency GCC routing', icon: Zap },
  ];

  const handleProfileSwitch = (id: string) => {
    setActiveProfile(id);
    if (id === 'nl') {
      setMtu(1420);
      setTcpBuffer(4194304);
      setCongestion('bbr');
    } else if (id === 'tr') {
      setMtu(1380);
      setTcpBuffer(2097152);
      setCongestion('cubic');
    } else if (id === 'ae') {
      setMtu(1360);
      setTcpBuffer(1048576);
      setCongestion('bbr');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Gaming Optimization</h1>
        <p className="text-slate-400 text-sm mt-1">Configure network parameters for lowest possible latency</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                activeProfile === profile.id ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
              )}>
                <profile.icon className="w-5 h-5" />
              </div>
              <h3 className={cn(
                "font-semibold",
                activeProfile === profile.id ? "text-blue-400" : "text-white"
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
          Network Core Parameters
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Auto MTU</label>
              <input
                type="number"
                value={mtu}
                onChange={(e) => setMtu(Number(e.target.value))}
                className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
              />
              <p className="text-xs text-slate-500 mt-1">Suggested for selected profile.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Congestion Algorithm</label>
              <select
                value={congestion}
                onChange={(e) => setCongestion(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-mono"
              >
                <option value="bbr">BBR (Recommended)</option>
                <option value="cubic">CUBIC</option>
                <option value="reno">RENO</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">BBR generally provides lower latency.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">TCP Buffer Size (Bytes)</label>
            <input
              type="number"
              value={tcpBuffer}
              onChange={(e) => setTcpBuffer(Number(e.target.value))}
              className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800 mt-4">
            <input type="checkbox" id="keepalive" defaultChecked className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-slate-900" />
            <label htmlFor="keepalive" className="text-sm font-medium text-slate-300 select-none">
              Enable Auto Keepalive (Reduces disconnects during gaming sessions)
            </label>
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
