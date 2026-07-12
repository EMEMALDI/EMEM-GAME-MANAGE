import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Server, Shield, Activity, Menu, X, Link, Boxes, Code, FileText, DownloadCloud } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Users', icon: Users, path: '/users' },
  { name: 'Servers', icon: Server, path: '/servers' },
  { name: 'Nodes', icon: Boxes, path: '/nodes' },
  { name: 'Subscriptions', icon: Link, path: '/subscriptions' },
  { name: 'Security', icon: Shield, path: '/security' },
  { name: 'Monitoring', icon: Activity, path: '/monitoring' },
  { name: 'Backups', icon: DownloadCloud, path: '/backups' },
  { name: 'Logs', icon: FileText, path: '/logs' },
  { name: 'Plugins', icon: Code, path: '/plugins' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg border-2 border-blue-500 bg-slate-900 flex items-center justify-center font-bold text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] text-lg">
          E
        </div>
        <span className="font-bold text-xl tracking-tight text-white uppercase" style={{ textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>EMEM PANEL</span>
      </div>
      
      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Modules</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
                isActive
                  ? 'bg-blue-500/10 text-blue-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)] border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 mt-auto border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-slate-300">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-200 truncate">{user?.username}</div>
            <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col glass border-r border-slate-800/50 fixed inset-y-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass border-b border-slate-800/50 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border-2 border-blue-500 bg-slate-900 flex items-center justify-center font-bold text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            E
          </div>
          <span className="font-bold text-lg tracking-tight text-white uppercase">EMEM PANEL</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-slate-300 p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 glass border-r border-slate-800/50 z-50 flex flex-col lg:hidden"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col relative z-10">
        <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
