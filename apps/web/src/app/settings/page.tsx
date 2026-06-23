'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { Settings, Bell, Shield, Palette, User, Check, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [dailyGoal, setDailyGoal] = useState(100);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    useAuthStore.getState().hydrate();
    if (!isAuthenticated && !localStorage.getItem('auth_token')) {
      router.push('/login');
    }
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (stored) setTheme(stored);
    const goal = localStorage.getItem('daily_goal');
    if (goal) setDailyGoal(Number(goal));
  }, [isAuthenticated, router]);

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('daily_goal', String(dailyGoal));
    document.documentElement.setAttribute('data-theme', theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[--bg-primary]">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-6">

            <div>
              <h1 className="text-2xl font-bold text-[--text-primary] flex items-center gap-2">
                <Settings size={22} /> Settings
              </h1>
              <p className="text-sm text-[--text-muted] mt-1">Manage your account and preferences.</p>
            </div>

            {/* Profile info */}
            <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-[--text-secondary] flex items-center gap-2">
                <User size={14} /> Account
              </h2>
              <div className="grid gap-3">
                <div>
                  <label className="text-xs text-[--text-muted] mb-1 block">Full Name</label>
                  <div className="px-3 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-sm text-[--text-primary]">
                    {user?.fullName || '—'}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[--text-muted] mb-1 block">Email</label>
                  <div className="px-3 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-sm text-[--text-muted]">
                    {user?.email || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-[--text-secondary] flex items-center gap-2">
                <Palette size={14} /> Appearance
              </h2>
              <div className="flex gap-3">
                {(['dark', 'light'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                      theme === t
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-[--border-default] text-[--text-muted] hover:border-[--text-muted]/40'
                    }`}
                  >
                    {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </button>
                ))}
              </div>
            </div>

            {/* Learning */}
            <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-[--text-secondary] flex items-center gap-2">
                <Bell size={14} /> Learning Goals
              </h2>
              <div>
                <label className="text-xs text-[--text-muted] mb-2 block">
                  Daily XP Goal: <span className="text-[--text-primary] font-bold">{dailyGoal} XP</span>
                </label>
                <input
                  type="range" min={50} max={500} step={50}
                  value={dailyGoal}
                  onChange={e => setDailyGoal(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-[--text-muted] mt-1">
                  <span>50</span><span>150</span><span>300</span><span>500</span>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-[--bg-surface] border border-red-500/20 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                <Shield size={14} /> Account Actions
              </h2>
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-all"
              >
                <LogOut size={14} /> Sign out of all devices
              </button>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all active:scale-95"
            >
              {saved ? <><Check size={15} /> Saved!</> : 'Save Changes'}
            </button>

          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}

