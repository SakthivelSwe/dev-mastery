'use client';

import Link from 'next/link';
import {
  Search, Sun, Moon, LogOut, Settings, User, ChevronDown, Sparkles, LayoutDashboard,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const [isDark, setIsDark] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    useAuthStore.getState().hydrate();
    const stored = localStorage.getItem('theme');
    if (stored === 'light') setIsDark(false);
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleLogout = () => {
    setShowMenu(false);
    logout();
    router.push('/');
  };

  const displayName = user?.fullName || user?.email || '';
  const initials = user
    ? (displayName || 'U').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : null;

  const openSearch = () =>
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));

  return (
    <header
      className="h-14 flex items-center px-4 sm:px-5 shrink-0 z-40 gap-3 border-b backdrop-blur-md"
      style={{
        background: 'color-mix(in oklab, var(--bg-surface) 82%, transparent)',
        borderColor: 'var(--border-default)',
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-1">
        <span
          className="inline-flex w-7 h-7 rounded-md items-center justify-center"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          <Sparkles size={15} />
        </span>
        <span
          className="hidden sm:inline text-[15px] font-medium tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          DevMastery
        </span>
      </Link>

      {/* Search */}
      <button
        onClick={openSearch}
        className="group flex items-center gap-2.5 flex-1 max-w-md px-3 py-1.5 rounded-md text-[13px] transition-all"
        style={{
          background: 'var(--bg-inset)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-muted)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
      >
        <Search size={13} />
        <span className="flex-1 text-left" style={{ color: 'var(--text-secondary)' }}>
          Search topics…
        </span>
        <kbd
          className="text-[10px] px-1.5 py-0.5 rounded font-mono"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-muted)',
          }}
        >
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-elevated)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {isAuthenticated && user ? (
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setShowMenu(p => !p)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              aria-label="User menu"
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-semibold"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  border: '1px solid var(--border-default)',
                }}
              >
                {initials}
              </div>
              <span
                className="text-[13px] hidden sm:block max-w-[140px] truncate"
                style={{ color: 'var(--text-secondary)' }}
              >
                {displayName}
              </span>
              <ChevronDown size={11} className="hidden sm:block" style={{ color: 'var(--text-muted)' }} />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-56 rounded-[10px] overflow-hidden z-50 shadow-xl"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                }}
              >
                <div
                  className="px-3.5 py-3 border-b"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  <p
                    className="text-[13px] font-medium truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {user.fullName || 'User'}
                  </p>
                  <p className="text-[11.5px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {user.email}
                  </p>
                </div>
                <div className="py-1">
                  <MenuItem href="/dashboard" icon={<LayoutDashboard size={13} />} onSelect={() => setShowMenu(false)}>
                    Dashboard
                  </MenuItem>
                  <MenuItem href="/profile" icon={<User size={13} />} onSelect={() => setShowMenu(false)}>
                    Profile
                  </MenuItem>
                  <MenuItem href="/settings" icon={<Settings size={13} />} onSelect={() => setShowMenu(false)}>
                    Settings
                  </MenuItem>
                </div>
                <div className="border-t py-1" style={{ borderColor: 'var(--border-default)' }}>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
                    style={{ color: 'var(--error)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(224,122,122,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="btn-primary text-[13px] px-3 py-1.5 ml-1"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

function MenuItem({
  href, icon, children, onSelect,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      {icon}
      {children}
    </Link>
  );
}
