import { useState } from 'react';
import { Server as ServerIcon, Plus, Settings, Trash2, Power, PowerOff, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function Servers() {
  const [servers, setServers] = useState([
    { id: 'srv-1', name: 'EU-West Main', country: 'NL', provider: 'Hetzner', ip: '192.168.1.1', status: 'active', latency: 12, users: 154 },
    { id: 'srv-2', name: 'US-East Relay', country: 'US', provider: 'DigitalOcean', ip: '10.0.0.1', status: 'maintenance', latency: 85, users: 42 }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Server Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage physical and virtual VPN nodes</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
          <Plus className="w-5 h-5" />
          Add Server
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {servers.map((srv) => (
          <motion.div key={srv.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-5 border border-slate-800/50 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${srv.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  <ServerIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{srv.name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="font-mono">{srv.ip}</span> &bull; <span>{srv.provider}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-slate-400 hover:text-blue-400 p-1"><Settings className="w-4 h-4" /></button>
                <button className="text-slate-400 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-1">Status</div>
                <div className={`text-sm font-medium capitalize ${srv.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {srv.status}
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-1">Latency</div>
                <div className="text-sm font-medium text-white flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-400" /> {srv.latency}ms</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-1">Active Users</div>
                <div className="text-sm font-medium text-white">{srv.users}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${srv.status === 'active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                {srv.status === 'active' ? <><PowerOff className="w-4 h-4" /> Disable</> : <><Power className="w-4 h-4" /> Enable</>}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
