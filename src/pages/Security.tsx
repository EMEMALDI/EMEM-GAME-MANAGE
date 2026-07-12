import { useState } from 'react';
import { Shield, Key, Smartphone, AlertTriangle, Monitor, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export function Security() {
  const [sessions] = useState([
    { id: '1', device: 'MacBook Pro 16"', browser: 'Chrome 122', ip: '192.168.1.1', location: 'London, UK', current: true, time: '2 mins ago' },
    { id: '2', device: 'iPhone 14 Pro', browser: 'Safari Mobile', ip: '10.0.0.5', location: 'London, UK', current: false, time: '3 hours ago' }
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Security</h1>
        <p className="text-slate-400 text-sm mt-1">Manage admin credentials, 2FA, and active sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              Credentials & Auth
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Username</label>
                  <input type="text" defaultValue="admin" className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div>
                  <div className="font-medium text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Two-Factor Authentication
                  </div>
                  <div className="text-sm text-slate-400 mt-1">Protect your account with TOTP (Google Authenticator)</div>
                </div>
                <button className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Enable 2FA
                </button>
              </div>
              
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20">
                Update Credentials
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Monitor className="w-5 h-5 text-purple-400" />
                Active Sessions
              </h2>
              <button className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                <LogOut className="w-4 h-4" /> Revoke All
              </button>
            </div>

            <div className="divide-y divide-slate-800/50">
              {sessions.map((session) => (
                <div key={session.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex gap-4">
                    <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                      {session.device.includes('iPhone') ? <Smartphone className="w-5 h-5 text-slate-400" /> : <Monitor className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        {session.device}
                        {session.current && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase">Current</span>}
                      </div>
                      <div className="text-sm text-slate-400 mt-0.5 flex items-center gap-2">
                        {session.browser} &bull; {session.ip}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{session.location} &bull; Active {session.time}</div>
                    </div>
                  </div>
                  {!session.current && (
                    <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border-red-500/20">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Access Control
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">IP Whitelist</label>
                <textarea rows={3} placeholder="192.168.1.1&#10;10.0.0.0/24" className="w-full bg-slate-900/50 border border-slate-800 text-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500/50 font-mono text-sm" />
                <p className="text-xs text-slate-500 mt-1">Leave empty to allow all IPs. Enter one per line.</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-slate-300">Rate Limiting</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500/50" />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-slate-300">Block Tor/VPN IPs</span>
                <input type="checkbox" className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
