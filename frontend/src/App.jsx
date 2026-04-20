// frontend/src/App.jsx
// Sentinel — Root application with top-nav-only layout (NO sidebar)
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';

import useAuthStore from '@/store/authStore';
import useThemeStore from '@/store/themeStore';
import ProtectedRoute from './pages/ProtectedRoute';
import TopBar from '@/components/layout/TopBar';
import CommandBar from '@/components/layout/CommandBar';

import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Analyze from '@/pages/Analyze';
import Results from '@/pages/Results';
import History from '@/pages/History';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import About from '@/pages/About';

// App shell — top bar only, full-width content (NO sidebar)
function AppShell() {
    const [commandOpen, setCommandOpen] = useState(false);

    // Global ⌘K handler
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandOpen(prev => !prev);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const handleCloseCommand = useCallback(() => setCommandOpen(false), []);

    return (
        <div className="min-h-screen bg-background text-text-primary">
            <TopBar variant="app" onOpenCommand={() => setCommandOpen(true)} />
            <CommandBar open={commandOpen} onClose={handleCloseCommand} />
            <main className="pt-12">
                <Outlet />
            </main>
        </div>
    );
}

export default function App() {
    const { hydrate } = useAuthStore();
    const { initTheme } = useThemeStore();
    
    useEffect(() => { 
        hydrate(); 
        initTheme();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'var(--panel)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                    },
                    success: { iconTheme: { primary: 'var(--risk-safe)', secondary: 'var(--panel)' } },
                    error: { iconTheme: { primary: 'var(--risk-critical)', secondary: 'var(--panel)' } },
                }}
            />
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route index element={<Landing />} />

                {/* Protected app routes — top-nav only, no sidebar */}
                <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                    <Route path="/app" element={<Dashboard />} />
                    <Route path="/app/analyze" element={<Analyze />} />
                    <Route path="/app/results/:id" element={<Results />} />
                    <Route path="/app/history" element={<History />} />
                    <Route path="/app/profile" element={<Profile />} />
                    <Route path="/app/settings" element={<Settings />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
}
