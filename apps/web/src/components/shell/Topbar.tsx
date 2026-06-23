'use client';

import Link from 'next/link';
import { Search, Bell, Sun, Moon, UserCircle2, LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const [isDark, setIsDark] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  // Hydrate auth state on mount
  useEffect(() => {
    useAuthStore.getState().hydrate();
    const stored = localStorage.getItem('theme');
    if (stored === 'light') setIsDark(false);
  }, []);

  // Close dropdown when clicking outside
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

  const initials = user
    ? (user.fullName || user.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : null;

  return (
    <header className="h-16 border-b border-[--border-default] flex items-center px-6 bg-[--bg-surface]/80 backdrop-blur-md shrink-0 z-40 gap-4">
      {/* Logo */}
      <Link href="/" className="font-display font-bold text-lg text-[--text-primary] tracking-tight mr-2">
        Dev<span className="text-[--accent-ai]">Mastery</span>
      </Link>

      {/* Search trigger */}
      <button
        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
        className="flex items-center gap-3 flex-1 max-w-sm bg-[--bg-elevated] border border-[--border-default] rounded-lg px-3 py-2 text-sm text-[--text-muted] hover:border-[--text-muted]/40 hover:text-[--text-secondary] transition-all"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Search topics…</span>
        <kbd className="text-[10px] bg-[--bg-surface] border border-[--border-default] px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-1">
        {/* Notifications — placeholder until backend supports it */}
        <button className="p-2 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-elevated] transition-all" aria-label="Notifications">
          <Bell size={18} />
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="p-2 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-elevated] transition-all" aria-label="Toggle theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Avatar / user menu */}
        {isAuthenticated && user ? (
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setShowMenu(p => !p)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[--bg-elevated] transition-all"
              aria-label="User menu"
            >
              {/* Avatar circle */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <span className="text-sm text-[--text-secondary] hidden sm:block max-w-[120px] truncate">
                {user.fullName || user.email}
              </span>
              <ChevronDown size={12} className="text-[--text-muted] hidden sm:block" />
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[--bg-surface] border border-[--border-default] rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[--border-default]">
                  <p className="text-xs font-semibold text-[--text-primary] truncate">{user.fullName}</p>
                  <p className="text-xs text-[--text-muted] truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/profile" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[--text-secondary] hover:bg-[--bg-elevated] hover:text-[--text-primary] transition-colors">
                    <User size={14} /> Profile
                  </Link>
                  <Link href="/settings" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[--text-secondary] hover:bg-[--bg-elevated] hover:text-[--text-primary] transition-colors">
                    <Settings size={14} /> Settings
                  </Link>
                  <Link href="/dashboard" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[--text-secondary] hover:bg-[--bg-elevated] hover:text-[--text-primary] transition-colors">
                    <Search size={14} /> Dashboard
                  </Link>
                </div>
                <div className="border-t border-[--border-default] py-1">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login"
            className="ml-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium transition-all">
            <UserCircle2 size={16} /> Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
