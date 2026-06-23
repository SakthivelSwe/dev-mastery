'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let msg = `Login failed (${res.status})`;
        try {
          const errorData = await res.json();
          msg = errorData.message || errorData.error || msg;
        } catch { /* non-JSON response */ }
        throw new Error(msg);
      }

      const data = await res.json();
      // Backend shape: { token, user: { id, email, fullName, roles } }
      login(data.token, {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName,
        roles: data.user.roles ?? [],
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Network error — is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-syne tracking-tight">
            Dev<span className="text-primary">Mastery</span>
          </h1>
          <p className="text-muted-foreground mt-2">Sign in to continue your learning journey.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-background border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-background border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-md hover:opacity-90 transition-opacity mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account? <a href="/register" className="text-primary hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}
