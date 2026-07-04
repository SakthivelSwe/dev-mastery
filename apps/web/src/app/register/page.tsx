'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!res.ok) {
        let msg = `Registration failed (${res.status})`;
        try {
          const errorData = await res.json();
          msg = errorData.message || errorData.error || msg;
        } catch { /* non-JSON */ }
        throw new Error(msg);
      }

      const data = await res.json();
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
    <div
      className="min-h-screen flex items-center justify-center px-5 py-12 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 400px at 50% -10%, var(--accent-soft) 0%, transparent 55%)',
        }}
      />

      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-[15px]"
          style={{ color: 'var(--text-primary)' }}
        >
          <span
            className="inline-flex w-7 h-7 rounded-md items-center justify-center"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <Sparkles size={15} />
          </span>
          <span className="font-medium tracking-tight">DevMastery</span>
        </Link>

        <div
          className="rounded-[14px] border p-7"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
          }}
        >
          <h1
            className="mb-1"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            Create your account.
          </h1>
          <p className="text-[13.5px]" style={{ color: 'var(--text-secondary)' }}>
            One workspace for every path you study.
          </p>

          {error && (
            <div
              className="mt-5 px-3 py-2.5 rounded-md text-[13px]"
              style={{
                background: 'rgba(224, 122, 122, 0.08)',
                border: '1px solid rgba(224, 122, 122, 0.25)',
                color: 'var(--error)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-4">
            <Field
              label="Full name"
              type="text"
              value={fullName}
              onChange={setFullName}
              placeholder="Jane Doe"
              autoFocus
            />
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="At least 8 characters"
              minLength={8}
            />

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-2 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        <p
          className="mt-6 text-center text-[13px]"
          style={{ color: 'var(--text-muted)' }}
        >
          Already have an account?{' '}
          <Link href="/login" className="font-medium" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label, type, value, onChange, placeholder, autoFocus, minLength,
}: {
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span
        className="block mb-1.5 text-[12.5px] font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <input
        type={type}
        required
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full px-3 py-2.5 rounded-md text-[14px] outline-none transition-all"
        style={{
          background: 'var(--bg-inset)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-ring)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </label>
  );
}
