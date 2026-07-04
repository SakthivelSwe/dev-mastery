'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { Settings, Bell, Shield, Sun, Moon, User, Check, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [dailyGoal, setDailyGoal] = useState(100);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    useAuthStore.getState().hydrate();
    if (!isAuthenticated && !localStorage.getItem('auth_token')) router.push('/login');
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

  const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div
      className="rounded-[14px] border p-5 space-y-4"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
    >
      <h2
        className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="max-w-2xl mx-auto space-y-5">

            <div className="mb-2">
              <h1
                className="flex items-center gap-2.5 mb-1"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.75rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                }}
              >
                <Settings size={20} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
                Settings
              </h1>
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                Manage your account and workspace preferences.
              </p>
            </div>

            {/* Account */}
            <Section icon={<User size={13} strokeWidth={1.75} />} title="Account">
              <div className="space-y-3">
                <ReadonlyField label="Full name" value={user?.fullName || '—'} />
                <ReadonlyField label="Email" value={user?.email || '—'} muted />
              </div>
            </Section>

            {/* Appearance */}
            <Section icon={<Sun size={13} strokeWidth={1.75} />} title="Appearance">
              <div className="flex gap-3">
                {(['dark', 'light'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className="flex-1 py-2.5 rounded-[10px] border text-[13px] font-medium capitalize transition-all"
                    style={{
                      background: theme === t ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                      borderColor: theme === t ? 'var(--accent)' : 'var(--border-default)',
                      color: theme === t ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    {t === 'dark' ? <><Moon size={13} className="inline mr-1.5" />Dark</> : <><Sun size={13} className="inline mr-1.5" />Light</>}
                  </button>
                ))}
              </div>
            </Section>

            {/* Learning goals */}
            <Section icon={<Bell size={13} strokeWidth={1.75} />} title="Learning goals">
              <div>
                <label
                  className="block text-[12.5px] mb-3"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Daily XP goal:{' '}
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {dailyGoal} XP
                  </span>
                </label>
                <input
                  type="range" min={50} max={500} step={50}
                  value={dailyGoal}
                  onChange={e => setDailyGoal(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <div
                  className="flex justify-between text-[10.5px] mt-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span>50</span><span>150</span><span>300</span><span>500</span>
                </div>
              </div>
            </Section>

            {/* Danger zone */}
            <Section
              icon={<Shield size={13} strokeWidth={1.75} />}
              title="Account actions"
            >
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-md border transition-colors"
                style={{
                  background: 'color-mix(in oklab, var(--error) 8%, transparent)',
                  borderColor: 'color-mix(in oklab, var(--error) 30%, var(--border-default))',
                  color: 'var(--error)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklab, var(--error) 15%, transparent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in oklab, var(--error) 8%, transparent)'; }}
              >
                <LogOut size={13} /> Sign out of all devices
              </button>
            </Section>

            {/* Save */}
            <button
              onClick={handleSave}
              className="btn-primary w-full py-2.5"
            >
              {saved ? <><Check size={14} /> Saved</> : 'Save changes'}
            </button>

          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}

function ReadonlyField({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <label
        className="block text-[11.5px] mb-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </label>
      <div
        className="px-3 py-2 rounded-md text-[13.5px]"
        style={{
          background: 'var(--bg-inset)',
          border: '1px solid var(--border-default)',
          color: muted ? 'var(--text-muted)' : 'var(--text-primary)',
        }}
      >
        {value}
      </div>
    </div>
  );
}
