import { useState } from 'react';
import { Link2, Copy, Download, QrCode } from 'lucide-react';

export function Subscriptions() {
  const [subLinks] = useState([
    { name: 'Default Profile', url: 'https://emem-panel.railway.app/sub/default', format: 'base64' },
    { name: 'Gaming Routing', url: 'https://emem-panel.railway.app/sub/gaming', format: 'json' },
    { name: 'Streaming Routing', url: 'https://emem-panel.railway.app/sub/streaming', format: 'clash' }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Subscriptions</h1>
        <p className="text-slate-400 text-sm mt-1">Manage global subscription links for clients (Sing-box, V2rayNG, Clash Meta)</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/50">
          <h2 className="text-lg font-semibold text-white">Global Subscription Links</h2>
          <p className="text-sm text-slate-400 mt-1">These URLs dynamically generate configs based on user profiles.</p>
        </div>
        <div className="divide-y divide-slate-800/50">
          {subLinks.map((link, idx) => (
            <div key={idx} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
              <div>
                <h3 className="font-medium text-white flex items-center gap-2">
                  {link.name}
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400 uppercase">{link.format}</span>
                </h3>
                <code className="text-xs text-slate-400 mt-2 block bg-slate-900/50 p-2 rounded-lg border border-slate-800">{link.url}</code>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { navigator.clipboard.writeText(link.url); alert('Copied!'); }} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors" title="Copy">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => { alert('Downloaded base config'); }} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors" title="Download Base">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => { alert('Show QR code'); }} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors" title="QR Code">
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
