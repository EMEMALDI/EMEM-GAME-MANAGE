import React, { useState, useEffect } from 'react';
import { Server as ServerIcon, Plus, Settings, Trash2, Power, PowerOff, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

export function Servers() {
  const { token } = useAuthStore();
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newCountry, setNewCountry] = useState('NL');
  const [newProvider, setNewProvider] = useState('Hetzner');
  const [newIp, setNewIp] = useState('');

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/servers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setServers(await res.json());
      } else if (res.status === 401 || res.status === 403) {
        useAuthStore.getState().logout();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `srv-${Date.now()}`,
          name: newName,
          country: newCountry,
          provider: newProvider,
          public_ip: newIp,
          region: 'eu-west',
          protocols: 'vless,tuic'
        })
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewName('');
        setNewIp('');
        fetchServers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteServer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this server?')) return;
    try {
      await fetch(`/api/servers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Server Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage physical and virtual VPN nodes</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
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
                    <span className="font-mono">{srv.public_ip}</span> &bull; <span>{srv.provider}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-slate-400 hover:text-blue-400 p-1"><Settings className="w-4 h-4" /></button>
                <button onClick={() => deleteServer(srv.id)} className="text-slate-400 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
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
                <div className="text-sm font-medium text-white flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-400" /> {srv.latency || Math.floor(Math.random() * 50) + 10}ms</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                <div className="text-xs text-slate-500 mb-1">Active Users</div>
                <div className="text-sm font-medium text-white">{srv.users || Math.floor(Math.random() * 100)}</div>
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

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-card rounded-2xl p-6"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-white mb-6">Add New Server</h2>
              
              <form onSubmit={handleAddServer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Server Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Public IP</label>
                  <input
                    type="text"
                    required
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Country</label>
                    <input
                      type="text"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Provider</label>
                    <input
                      type="text"
                      value={newProvider}
                      onChange={(e) => setNewProvider(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                    Add Server
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
