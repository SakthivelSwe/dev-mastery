'use client';

import Link from 'next/link';
import { Search, Bell, Sun, Moon, UserCircle2 } from 'lucide-react';
import { useState } from 'react';

export function Topbar() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <header className="h-16 border-b border-[--border-default] flex items-center px-6 bg-[--bg-surface]/80 backdrop-blur-md shrink-0 z-40 gap-4">
      {/* Logo */}
      <Link href="/" className="font-display font-bold text-lg text-[--text-primary] tracking-tight mr-2">
        Dev<span className="text-[--accent-ai]">Mastery</span>
      </Link>

      {/* Search trigger */}
      <button
        onClick={() => {
          // Dispatch a synthetic ⌘K keydown to open CommandPalette
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
        }}
        className="flex items-center gap-3 flex-1 max-w-sm bg-[--bg-elevated] border border-[--border-default] rounded-lg px-3 py-2 text-sm text-[--text-muted] hover:border-[--text-muted]/40 hover:text-[--text-secondary] transition-all"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Search topics…</span>
        <kbd className="text-[10px] bg-[--bg-surface] border border-[--border-default] px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-1">
        {/* Notifications */}
        <button
          className="p-2 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-elevated] transition-all relative"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[--accent-java] rounded-full" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-elevated] transition-all"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Avatar / Profile */}
        <Link
          href="/profile"
          className="p-2 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-elevated] transition-all ml-1"
          aria-label="Profile"
        >
          <UserCircle2 size={22} />
        </Link>
      </div>
    </header>
  );
}
