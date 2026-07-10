'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { loginSchema, fieldErrors } from '@/lib/validation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    // Validate client-side with Zod before touching the network.
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Too many attempts. Please wait a minute and try again.');
        }
        let msg = `Sign-in failed (${res.status})`;
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
      {/* soft radial */}
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
            Welcome back.
          </h1>
          <p className="text-[13.5px]" style={{ color: 'var(--text-secondary)' }}>
            Sign in to continue where you left off.
          </p>

          {error && (
            <div
              role="alert"
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

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4" noValidate>
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoFocus
              error={errors.email}
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Your password"
              error={errors.password}
            />

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-2 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
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
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ── Local field primitive ────────────────────────────────────── */
function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoFocus,
  error,
}: {
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  error?: string;
}) {
  const errorId = error ? `${label.toLowerCase()}-error` : undefined;
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className="w-full px-3 py-2.5 rounded-md text-[14px] outline-none transition-all"
        style={{
          background: 'var(--bg-inset)',
          border: `1px solid ${error ? 'var(--error)' : 'var(--border-default)'}`,
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-ring)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? 'var(--error)'
            : 'var(--border-default)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && (
        <span
          id={errorId}
          role="alert"
          className="mt-1 block text-[12px]"
          style={{ color: 'var(--error)' }}
        >
          {error}
        </span>
      )}
    </label>
  );
}
