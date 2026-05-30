'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { AUTH_API } from '@/lib/api';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${AUTH_API}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await res.json();
      login(data.token, {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="w-full max-w-md p-8 rounded-xl shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Dev<span style={{ color: 'var(--accent-java)' }}>Mastery</span>
            </h1>
          </a>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Create your free account and start learning.</p>
        </div>

        {error && (
          <div className="p-3 rounded-md mb-6 text-sm" style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: 'var(--error)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-3 mt-2">
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: 'var(--accent-ai)' }} className="hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
