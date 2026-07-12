/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Servers } from './pages/Servers';
import { Subscriptions } from './pages/Subscriptions';
import { Security } from './pages/Security';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(state => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="servers" element={<Servers />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="nodes" element={<div className="text-white p-4 font-mono">Module: Nodes Manager (Coming Soon)</div>} />
          <Route path="security" element={<Security />} />
          <Route path="monitoring" element={<div className="text-white p-4 font-mono">Module: Network Diagnostics (Coming Soon)</div>} />
          <Route path="backups" element={<div className="text-white p-4 font-mono">Module: Automated Backups (Coming Soon)</div>} />
          <Route path="logs" element={<div className="text-white p-4 font-mono">Module: Audit Logs (Coming Soon)</div>} />
          <Route path="plugins" element={<div className="text-white p-4 font-mono">Module: Plugin System (Coming Soon)</div>} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
