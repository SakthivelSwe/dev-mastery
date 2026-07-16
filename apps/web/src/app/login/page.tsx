'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { loginSchema, fieldErrors } from '@/lib/validation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://devmastery-core.onrender.com' : 'http://localhost:8080');

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
      {/* Dynamic Animated Grid Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--border-default) 1px, transparent 1px),
            linear-gradient(to bottom, var(--border-default) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 70%)'
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-40 animate-pulse-slow"
        style={{
          background:
            'radial-gradient(600px circle at 50% 0%, var(--accent-soft) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2.5 text-[16px] hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-primary)' }}
        >
          <span
            className="inline-flex w-8 h-8 rounded-lg items-center justify-center shadow-lg shadow-[var(--accent-soft)]"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            <Sparkles size={16} />
          </span>
          <span className="font-semibold tracking-tight">DevMastery</span>
        </Link>

        <div
          className="w-full rounded-2xl p-8 shadow-2xl backdrop-blur-xl border"
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <div className="mb-8 text-center">
            <h1
              className="mb-2 text-2xl font-bold tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
              }}
            >
              Welcome back
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              Sign in to continue mastering engineering.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 px-4 py-3 rounded-lg text-[13px] font-medium flex items-start gap-2"
              style={{
                background: 'rgba(224, 122, 122, 0.1)',
                border: '1px solid rgba(224, 122, 122, 0.3)',
                color: 'var(--error)',
              }}
            >
              <div className="mt-0.5">•</div>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5" noValidate>
            <Field
              label="Email address"
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
              placeholder="••••••••"
              error={errors.password}
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 py-3 rounded-xl font-medium text-[15px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p
          className="mt-8 text-center text-[14px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-medium hover:underline underline-offset-4 transition-all"
            style={{ color: 'var(--text-primary)' }}
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
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <label className="block relative">
      <span
        className="block mb-1.5 text-[12.5px] font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <div className="relative">
        <input
          type={inputType}
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
            paddingRight: isPassword ? '40px' : '12px'
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
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--bg-surface)] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
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
