'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Braces,
  Coffee,
  Cpu,
  Layers3,
  Network,
  Puzzle,
  Sparkles,
  Sprout,
  Target,
  Waves,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';

/* ────────────────────────────────────────────────────────────────
   Learning paths — slugs MUST match learning_paths.slug in the DB.
   Icons are monochrome (lucide) to keep the layout calm.
   ──────────────────────────────────────────────────────────────── */
type Path = {
  slug: string;
  title: string;
  blurb: string;
  Icon: typeof Coffee;
  accent: string;
  level: string;
  topics: number;
};

const PATHS: Path[] = [
  { slug: 'java-mastery',          title: 'Java',                 blurb: 'Core Java → OOP → Collections → Streams → Concurrency → JVM.',        Icon: Coffee,   accent: 'var(--accent-java)',      level: '1–5', topics: 120 },
  { slug: 'dsa',                   title: 'Data Structures & Algorithms', blurb: 'Arrays → Trees → Graphs → DP → Greedy → Backtracking.',        Icon: Puzzle,   accent: 'var(--accent-dsa)',       level: '1–5', topics: 95  },
  { slug: 'spring-boot',           title: 'Spring Boot',          blurb: 'Spring Core → REST → JPA → Security → Kafka → Observability.',        Icon: Sprout,   accent: 'var(--accent-spring)',    level: '2–5', topics: 80  },
  { slug: 'react',                 title: 'React',                blurb: 'Hooks → State → Performance → Patterns → Next.js → RxJS.',            Icon: Waves,    accent: 'var(--accent-react)',     level: '1–5', topics: 70  },
  { slug: 'system-design',         title: 'System Design',        blurb: 'Scalability → CAP → Caching → Sharding → Queues → Case studies.',    Icon: Network,  accent: 'var(--accent-ai)',        level: '3–5', topics: 50  },
  { slug: 'software-architecture', title: 'Software Architecture', blurb: 'Layered, Hexagonal, Event-driven, DDD, CQRS, Saga patterns.',        Icon: Layers3,  accent: 'var(--accent-kotlin)',    level: '2–5', topics: 45  },
  { slug: 'leetcode-patterns',     title: 'LeetCode Patterns',    blurb: 'Twenty universal patterns: two pointers, sliding window, BFS/DFS…',   Icon: Target,   accent: 'var(--accent-interview)', level: '2–5', topics: 40  },
  { slug: 'microservices',         title: 'Microservices',        blurb: 'Spring Cloud, Resilience4j, Kafka, service discovery, K8s.',          Icon: Boxes,    accent: 'var(--accent-spring)',    level: '2–5', topics: 28  },
];

/* ────────────────────────────────────────────────────────────────
   The six teaching layers.
   ──────────────────────────────────────────────────────────────── */
const LAYERS = [
  { n: '01', label: 'Why',        text: 'What problem does this concept solve, and why does it exist at all?' },
  { n: '02', label: 'Theory',     text: 'The full conceptual model, with analogies grounded in real systems.' },
  { n: '03', label: 'Visual',     text: 'Animated, step-by-step visualisations for algorithms and data flow.' },
  { n: '04', label: 'Code',       text: 'Runnable code with inline commentary, from beginner to expert.' },
  { n: '05', label: 'Real world', text: 'How the concept shows up in production systems you actually use.' },
  { n: '06', label: 'Interview',  text: 'Conceptual, coding and edge-case questions — with honest answers.' },
];

/* ────────────────────────────────────────────────────────────────
   Navbar
   ──────────────────────────────────────────────────────────────── */
function Navbar({ isAuthenticated, mounted }: { isAuthenticated: boolean; mounted: boolean }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md"
      style={{
        background: 'color-mix(in oklab, var(--bg-primary) 82%, transparent)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group" id="nav-logo">
          <span
            className="inline-flex w-7 h-7 rounded-md items-center justify-center"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <Sparkles size={15} />
          </span>
          <span
            className="text-[15px] font-medium tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            DevMastery
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {([
            { href: '#paths',    label: 'Paths'    },
            { href: '#method',   label: 'Method'   },
            { href: '#features', label: 'Features' },
          ]).map((item) => (
            <a key={item.href} href={item.href} className="btn-quiet">
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!mounted ? (
            <div className="w-24 h-9 bg-[var(--bg-inset)] rounded-md animate-pulse"></div>
          ) : isAuthenticated ? (
            <Link href="/dashboard" id="nav-continue" className="btn-primary text-sm px-4 py-2">
              Dashboard
              <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link href="/login" id="nav-signin" className="btn-quiet">
                Sign in
              </Link>
              <Link href="/register" id="nav-continue" className="btn-primary text-sm px-4 py-2">
                Create account
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ────────────────────────────────────────────────────────────────
   Hero — quiet, no marketing chatter
   ──────────────────────────────────────────────────────────────── */
function Hero({ isAuthenticated, mounted }: { isAuthenticated: boolean; mounted: boolean }) {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-24 sm:pt-36 sm:pb-32 overflow-hidden"
    >
      {/* soft radial wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 500px at 50% -10%, var(--accent-soft) 0%, transparent 60%)',
        }}
      />
      {/* faint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse 60% 50% at 50% 30%, black 40%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 60% 50% at 50% 30%, black 40%, transparent 85%)',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-5 sm:px-6 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium"
          style={{
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            background: 'var(--bg-surface)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
          Personal engineering workspace
        </div>

        <h1
          className="mt-6 text-balance"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
          }}
        >
          A quieter place to&nbsp;
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>
            master engineering
          </em>
          .
        </h1>

        <p
          className="mt-6 mx-auto text-pretty"
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.075rem',
            lineHeight: 1.65,
            maxWidth: '36rem',
          }}
        >
          Structured paths, animated concepts, honest interview prep. Every topic taught across six
          layers — from <span style={{ color: 'var(--text-primary)' }}>why</span> to
          production usage. Nothing skipped, nothing exercised-for-the-reader.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {!mounted ? (
            <div className="w-48 h-12 bg-[var(--bg-inset)] rounded-md animate-pulse"></div>
          ) : isAuthenticated ? (
            <Link href="/dashboard" className="btn-primary flex items-center gap-2 px-6 py-3 text-[15px]">
              Continue where you left off
              <ArrowRight size={16} />
            </Link>
          ) : (
            <Link href="/register" className="btn-primary flex items-center gap-2 px-6 py-3 text-[15px]">
              Create an account
              <ArrowRight size={16} />
            </Link>
          )}
          <a href="#paths" className="btn-quiet px-6 py-3 text-[15px]">
            Browse paths
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px]"
             style={{ color: 'var(--text-muted)' }}>
          <span>8 paths</span>
          <span>·</span>
          <span>6-layer method</span>
          <span>·</span>
          <span>Animated visualisations</span>
          <span>·</span>
          <span>Feynman check-ins</span>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Paths grid
   ──────────────────────────────────────────────────────────────── */
function PathCard({ path }: { path: Path }) {
  const { Icon } = path;
  return (
    <Link
      href={`/learn/${path.slug}/roadmap`}
      id={`path-card-${path.slug}`}
      className="group card p-5 sm:p-6 block"
    >
      <div className="flex items-start gap-4">
        <span
          className="shrink-0 inline-flex w-10 h-10 rounded-lg items-center justify-center border transition-colors"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-default)',
            color: path.accent,
          }}
        >
          <Icon size={18} strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3
              className="text-[17px] font-medium tracking-tight truncate"
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {path.title}
            </h3>
            <ArrowRight
              size={16}
              className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
              style={{ color: 'var(--accent)' }}
            />
          </div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {path.blurb}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="chip">L {path.level}</span>
            <span className="chip">{path.topics} topics</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PathsSection() {
  return (
    <section id="paths" className="max-w-6xl mx-auto px-5 sm:px-6 py-20 sm:py-28">
      <div className="text-center">
        <span className="section-eyebrow">Learning paths</span>
        <h2 className="section-title">Pick a track. Go deep.</h2>
        <p className="section-sub">
          Eight structured tracks. Each topic passes through six teaching layers before it is marked
          complete.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
        {PATHS.map((p) => (
          <PathCard key={p.slug} path={p} />
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Method (six layers)
   ──────────────────────────────────────────────────────────────── */
function MethodSection() {
  return (
    <section
      id="method"
      className="py-20 sm:py-28"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="text-center">
          <span className="section-eyebrow">The method</span>
          <h2 className="section-title">Six layers, in order.</h2>
          <p className="section-sub">
            Every single topic is taught the same way. No shortcuts, no “exercise for the reader”.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LAYERS.map((l) => (
            <li
              key={l.n}
              className="p-5 rounded-[10px] border"
              style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-default)',
              }}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className="text-[13px] tabular-nums"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}
                >
                  {l.n}
                </span>
                <span
                  className="text-[15px]"
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                  }}
                >
                  {l.label}
                </span>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {l.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Features
   ──────────────────────────────────────────────────────────────── */
const FEATURES = [
  { Icon: Cpu,      title: 'Animated visualisers',       text: 'Step-by-step animations for algorithms, data flow and JVM internals, wired to the code you are reading.' },
  { Icon: Sparkles, title: 'Grounded AI mentor',         text: 'Answers doubts, debugs code and runs Feynman check-ins — always cited against your current topic.' },
  { Icon: Braces,   title: 'In-browser code lab',        text: 'Monaco Editor with a persistent scratch area. Run Java, Python, TypeScript, Kotlin — no setup.' },
  { Icon: Layers3,  title: 'Six-layer coverage',         text: 'Why → Theory → Visual → Code → Real world → Interview. Progress locks until each layer is done.' },
  { Icon: Target,   title: 'Honest interview prep',      text: 'Real interview questions, edge cases, and follow-ups — with the answers a senior engineer would give.' },
  { Icon: Network,  title: 'Spaced review',              text: 'Topics you complete return on a spaced schedule so nothing quietly rots out of memory.' },
];

function FeaturesSection() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-5 sm:px-6 py-20 sm:py-28">
      <div className="text-center">
        <span className="section-eyebrow">Features</span>
        <h2 className="section-title">What&apos;s inside.</h2>
      </div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            id={`feature-${f.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="card p-5 sm:p-6"
          >
            <span
              className="inline-flex w-9 h-9 rounded-md items-center justify-center"
              style={{ background: 'var(--bg-elevated)', color: 'var(--accent)' }}
            >
              <f.Icon size={17} strokeWidth={1.6} />
            </span>
            <h3
              className="mt-4 text-[16px] font-medium tracking-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
            >
              {f.title}
            </h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {f.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Quiet CTA
   ──────────────────────────────────────────────────────────────── */
function CtaSection({ isAuthenticated, mounted }: { isAuthenticated: boolean; mounted: boolean }) {
  return (
    <section
      className="py-20 sm:py-28"
      style={{
        borderTop: '1px solid var(--border-default)',
        background:
          'radial-gradient(ellipse at 50% 40%, var(--accent-soft) 0%, transparent 60%)',
      }}
    >
      <div className="max-w-2xl mx-auto px-5 text-center">
        <h2 className="section-title">Continue where you left off.</h2>
        <p className="section-sub">
          Your progress, streak, and next topics live in the workspace.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {!mounted ? (
            <div className="w-48 h-12 bg-[var(--bg-inset)] rounded-md animate-pulse mx-auto"></div>
          ) : isAuthenticated ? (
            <Link href="/dashboard" id="cta-continue" className="btn-primary px-6 py-3">
              Open workspace
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link href="/register" id="cta-continue" className="btn-primary px-6 py-3">
                Create account
                <ArrowRight size={16} />
              </Link>
              <Link href="/login" id="cta-signin" className="btn-ghost px-6 py-3">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Footer
   ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      className="py-10"
      style={{
        borderTop: '1px solid var(--border-default)',
        background: 'var(--bg-surface)',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]"
           style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex w-5 h-5 rounded items-center justify-center"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <Sparkles size={11} />
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>DevMastery</span>
        </div>
        <div>Personal edition · {new Date().getFullYear()}</div>
        <div className="flex gap-5">
          <Link href="/dashboard" className="hover:text-[--text-primary] transition-colors">Workspace</Link>
          <a href="#paths"    className="hover:text-[--text-primary] transition-colors">Paths</a>
          <a href="#method"   className="hover:text-[--text-primary] transition-colors">Method</a>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { isAuthenticated, hydrate } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} mounted={mounted} />
      <main>
        <Hero isAuthenticated={isAuthenticated} mounted={mounted} />
        <PathsSection />
        <MethodSection />
        <FeaturesSection />
        <CtaSection isAuthenticated={isAuthenticated} mounted={mounted} />
      </main>
      <Footer />
    </>
  );
}
