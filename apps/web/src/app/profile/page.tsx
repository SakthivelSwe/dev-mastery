'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Zap, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated || !user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const initials = user.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[--bg-primary]">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[--text-muted] hover:text-[--text-primary] text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        {/* Profile Card */}
        <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-8 mb-6">
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[--accent-ai] to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[--text-primary]">{user.fullName}</h1>
              <p className="text-[--text-muted] text-sm mt-1">{user.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-[--accent-ai]/15 text-[--accent-ai] border border-[--accent-ai]/20">
                <Shield size={11} />
                {user.role}
              </span>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[--bg-elevated] rounded-xl border border-[--border-default]">
              <User size={18} className="text-[--text-muted] shrink-0" />
              <div>
                <p className="text-[11px] text-[--text-muted] uppercase tracking-wider mb-0.5">Full Name</p>
                <p className="text-sm font-medium text-[--text-primary]">{user.fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[--bg-elevated] rounded-xl border border-[--border-default]">
              <Mail size={18} className="text-[--text-muted] shrink-0" />
              <div>
                <p className="text-[11px] text-[--text-muted] uppercase tracking-wider mb-0.5">Email Address</p>
                <p className="text-sm font-medium text-[--text-primary]">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[--bg-elevated] rounded-xl border border-[--border-default]">
              <Zap size={18} className="text-[--accent-java] shrink-0" />
              <div>
                <p className="text-[11px] text-[--text-muted] uppercase tracking-wider mb-0.5">User ID</p>
                <p className="text-xs font-mono text-[--text-secondary] break-all">{user.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500/20 hover:border-red-500/40 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

