import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreVertical, ShieldCheck, QrCode, Copy, Trash2, Edit, X, Activity, Download } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';

interface VPNUser {
  id: string;
  name: string;
  bandwidth_limit: number;
  bandwidth_used: number;
  expire_at: string;
  status: string;
  protocol: string;
}

export function Users() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<VPNUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserProtocol, setNewUserProtocol] = useState('vless');
  const [newUserLimit, setNewUserLimit] = useState(0);

  // Config Modal State
  const [configModal, setConfigModal] = useState<{ open: boolean; user: VPNUser | null; configStr: string }>({
    open: false,
    user: null,
    configStr: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else if (res.status === 401 || res.status === 403) {
        useAuthStore.getState().logout();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const renewUser = async (id: string) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ expire_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() })
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const resetTraffic = async (id: string) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ bandwidth_used: 0 })
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const copySubscription = async (id: string) => {
    const subLink = `${window.location.origin}/sub/${id}`;
    await navigator.clipboard.writeText(subLink);
    alert('Subscription URL copied!');
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: uuidv4(),
          name: newUserName,
          bandwidth_limit: newUserLimit * 1024 * 1024 * 1024, // GB to Bytes
          protocol: newUserProtocol,
          expire_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewUserName('');
        fetchUsers();
      } else if (res.status === 401 || res.status === 403) {
        useAuthStore.getState().logout();
        alert('Session expired. Please log in again.');
      } else {
        let errorMsg = 'Unknown error';
        try {
          const err = await res.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `Server error: ${res.status} ${res.statusText}`;
        }
        alert('Error creating user: ' + errorMsg);
      }
    } catch (e: any) {
      console.error(e);
      alert('Error creating user: ' + e.message);
    }
  };

  const handleGenerateConfig = async (user: VPNUser) => {
    try {
      const res = await fetch(`/api/config/generate/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConfigModal({ open: true, user, configStr: JSON.stringify(data.config, null, 2) });
      } else {
        alert('Failed to generate config');
      }
    } catch (e) {
      console.error(e);
      alert('Error generating config');
    }
  };

  const copyConfig = async () => {
    if (configModal.configStr) {
      await navigator.clipboard.writeText(configModal.configStr);
      alert('Config copied to clipboard!');
    }
  };

  const downloadConfig = () => {
    if (!configModal.configStr || !configModal.user) return;
    const blob = new Blob([configModal.configStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-${configModal.user.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage VPN accounts, bandwidth, and protocols</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800/50 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or UUID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-slate-900/50 border border-slate-800 text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
              <option value="all">All Protocols</option>
              <option value="vless">VLESS</option>
              <option value="tuic">TUIC v5</option>
              <option value="hysteria2">Hysteria2</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Name / UUID</th>
                <th className="px-6 py-4">Protocol</th>
                <th className="px-6 py-4">Bandwidth</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={user.id} 
                    className="hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1">{user.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider",
                        user.protocol === 'vless' ? "bg-purple-500/10 text-purple-400" :
                        user.protocol === 'tuic' ? "bg-amber-500/10 text-amber-400" :
                        "bg-blue-500/10 text-blue-400"
                      )}>
                        {user.protocol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full w-24">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: user.bandwidth_limit === 0 ? '0%' : `${Math.min(100, (user.bandwidth_used / user.bandwidth_limit) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">
                          {user.bandwidth_limit === 0 ? '∞' : `${(user.bandwidth_limit / 1024 / 1024 / 1024).toFixed(0)}GB`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {user.expire_at ? format(new Date(user.expire_at), 'MMM dd, yyyy') : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", user.status === 'active' ? "bg-emerald-500" : "bg-red-500")} />
                        <span className="capitalize">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => renewUser(user.id)} className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Renew (+30 Days)">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button onClick={() => resetTraffic(user.id)} className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors" title="Reset Traffic">
                          <Activity className="w-4 h-4" />
                        </button>
                        <button onClick={() => copySubscription(user.id)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Copy Subscription URL">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleGenerateConfig(user)} className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors" title="Create / Show Config">
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Edit User">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete User">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {configModal.open && configModal.user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfigModal({ open: false, user: null, configStr: '' })}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-card rounded-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setConfigModal({ open: false, user: null, configStr: '' })}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-white mb-6">Config: {configModal.user.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
                <div className="flex flex-col items-center justify-start bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                  <div className="bg-white p-2 rounded-lg shadow-xl mb-4">
                    <QRCodeSVG value={configModal.configStr || "empty"} size={160} />
                  </div>
                  <p className="text-xs text-slate-400 text-center">Scan with V2rayNG, Shadowrocket, or Nekobox</p>
                  
                  <div className="w-full space-y-2 mt-6">
                    <button onClick={copyConfig} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg transition-colors">
                      <Copy className="w-4 h-4" /> Copy Config
                    </button>
                    <button onClick={downloadConfig} className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                      <Download className="w-4 h-4" /> Download JSON
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-2 overflow-y-auto bg-slate-950/50 rounded-xl border border-slate-800 p-4">
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                    {configModal.configStr}
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              
              <h2 className="text-xl font-bold text-white mb-6">Add New User</h2>
              
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="e.g. user123"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Protocol</label>
                    <select
                      value={newUserProtocol}
                      onChange={(e) => setNewUserProtocol(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                    >
                      <option value="vless">VLESS + Reality</option>
                      <option value="tuic">TUIC v5</option>
                      <option value="hysteria2">Hysteria2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Device Limit</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 = unl"
                      className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Bandwidth Limit (GB) - 0 for unlimited</label>
                  <input
                    type="number"
                    min="0"
                    value={newUserLimit}
                    onChange={(e) => setNewUserLimit(Number(e.target.value))}
                    className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="premium, gaming"
                    className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                  >
                    Create User
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
