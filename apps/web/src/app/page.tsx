'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ─── Learning Path data (matches V6 seed migration) ─────────── */
const LEARNING_PATHS = [
  {
    slug: 'java-mastery',
    title: 'Java Mastery',
    description: 'Core Java → OOP → Collections → Streams → Concurrency → JVM Internals',
    icon: '☕',
    accent: 'var(--accent-java)',
    level: '1–5',
    topics: 120,
    hours: 120,
    gradient: 'gradient-java',
  },
  {
    slug: 'dsa-mastery',
    title: 'DSA Mastery',
    description: 'Arrays → Trees → Graphs → DP → Greedy → Backtracking. Crack any coding interview.',
    icon: '🧩',
    accent: 'var(--accent-dsa)',
    level: '1–5',
    topics: 95,
    hours: 100,
    gradient: 'gradient-kotlin',
  },
  {
    slug: 'spring-boot-mastery',
    title: 'Spring Boot Mastery',
    description: 'Spring Core → REST → JPA → Security → Microservices → Kafka → Valkey',
    icon: '🌱',
    accent: 'var(--accent-spring)',
    level: '2–5',
    topics: 80,
    hours: 90,
    gradient: 'gradient-spring',
  },
  {
    slug: 'frontend-mastery',
    title: 'Frontend Mastery',
    description: 'HTML/CSS → JavaScript → TypeScript → React → Angular → Next.js → RxJS',
    icon: '⚛️',
    accent: 'var(--accent-react)',
    level: '1–5',
    topics: 70,
    hours: 80,
    gradient: 'gradient-react',
  },
  {
    slug: 'system-design-mastery',
    title: 'System Design',
    description: 'Scalability → CAP Theorem → Caching → Sharding → Message Queues → Case Studies',
    icon: '🏗️',
    accent: 'var(--accent-system)',
    level: '3–5',
    topics: 50,
    hours: 60,
    gradient: 'gradient-java',
  },
  {
    slug: 'design-patterns',
    title: 'Design Patterns',
    description: 'All 23 GoF patterns + Architectural patterns. Creational → Structural → Behavioral',
    icon: '🔷',
    accent: 'var(--accent-ai)',
    level: '2–5',
    topics: 45,
    hours: 50,
    gradient: 'gradient-ai',
  },
  {
    slug: 'interview-preparation',
    title: 'Interview Prep',
    description: '450 problems · 2000+ MCQs · LLD · HLD · Mock Interviews with AI',
    icon: '🎯',
    accent: 'var(--accent-interview)',
    level: '2–5',
    topics: 40,
    hours: 40,
    gradient: 'gradient-spring',
  },
];

/* ─── Feature highlights ─────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🎬',
    title: 'DSA Visualizer',
    description: 'Step-by-step animated visualizations for 40+ algorithms. D3.js powered, with synchronized code highlighting.',
  },
  {
    icon: '🤖',
    title: 'AI Mentor (DevMentor)',
    description: 'Powered by Google Gemini — answers doubts, debugs code, runs mock interviews adapted to your skill level.',
  },
  {
    icon: '⚡',
    title: 'In-Browser Code Lab',
    description: 'Monaco Editor (VS Code engine) + Judge0 CE. Run Java, Python, TypeScript, Kotlin in your browser. Unlimited.',
  },
  {
    icon: '📐',
    title: '6-Layer Teaching Model',
    description: 'Every topic: WHY → Theory → Visual → Code → Real World → Interview. Nothing skipped. Nothing left vague.',
  },
  {
    icon: '🏆',
    title: 'Gamification',
    description: 'Daily streaks, XP, badges (Apprentice → Master), leaderboards, and completion certificates.',
  },
  {
    icon: '📱',
    title: 'Android App',
    description: 'Native Kotlin + Jetpack Compose app with offline-first support. Learn anywhere, sync automatically.',
  },
];

/* ─── Navbar ─────────────────────────────────────────────────── */
function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: 'rgba(13, 17, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" id="nav-logo">
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            Dev<span style={{ color: 'var(--accent-java)' }}>Mastery</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          {['Paths', 'Visualizer', 'Code Lab', 'AI Mentor'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-sm transition-colors duration-150"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button
            id="nav-signin"
            className="btn-ghost text-sm px-4 py-2"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
          >
            Sign In
          </button>
          <button
            id="nav-getstarted"
            className="btn-primary text-sm px-4 py-2"
          >
            Get Started Free
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero Section ───────────────────────────────────────────── */
function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-center px-4"
      style={{
        background: 'radial-gradient(ellipse at 50% -20%, rgba(66,133,244,0.12) 0%, transparent 60%), var(--bg-primary)',
      }}
      id="hero"
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto pt-24 pb-20">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{
            background: 'rgba(66,133,244,0.1)',
            border: '1px solid rgba(66,133,244,0.3)',
            color: 'var(--accent-ai)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          100% Free Stack · Powered by Google Gemini · Oracle Cloud Free Tier
        </div>

        {/* Heading */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Master Every Technology.
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, var(--accent-java) 0%, var(--accent-ai) 50%, var(--accent-kotlin) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Miss Nothing.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          From complete beginner to senior engineer. Depth-first, concept-complete learning with
          animated visualizations, AI mentoring, and a real code lab.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="hero-start"
            className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto"
          >
            Start Learning Free →
          </button>
          <button
            id="hero-paths"
            className="btn-ghost text-base px-8 py-3.5 w-full sm:w-auto"
          >
            Browse Learning Paths
          </button>
        </div>

        {/* Stats */}
        <div
          className="flex flex-wrap justify-center gap-8 mt-16 pt-10"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          {[
            { value: '7', label: 'Learning Paths' },
            { value: '450+', label: 'DSA Problems' },
            { value: '2000+', label: 'Quiz Questions' },
            { value: '40+', label: 'Visualizations' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div
                className="text-3xl font-bold mb-1"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                {value}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Path Card ──────────────────────────────────────────────── */
function PathCard({ path }: { path: typeof LEARNING_PATHS[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      id={`path-card-${path.slug}`}
      className="relative rounded-xl border cursor-pointer overflow-hidden transition-all duration-300"
      style={{
        background: hovered
          ? `linear-gradient(135deg, rgba(${path.accent.includes('java') ? '248,152,32' : path.accent.includes('spring') ? '109,179,63' : '66,133,244'}, 0.06) 0%, var(--bg-surface) 60%)`
          : 'var(--bg-surface)',
        borderColor: hovered ? path.accent : 'var(--border-default)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 8px 30px rgba(0,0,0,0.4)` : 'none',
        padding: '24px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left accent border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 transition-opacity duration-300"
        style={{ background: path.accent, opacity: hovered ? 1 : 0 }}
      />

      {/* Icon + title */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{path.icon}</span>
        <div>
          <h3
            className="font-bold text-lg mb-0.5"
            style={{
              fontFamily: 'var(--font-display)',
              color: hovered ? path.accent : 'var(--text-primary)',
              transition: 'color 0.2s ease',
            }}
          >
            {path.title}
          </h3>
          <div className="flex gap-2">
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              Level {path.level}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              {path.hours}h
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
        {path.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {path.topics} topics
        </span>
        <span
          className="text-xs font-medium transition-colors duration-200"
          style={{ color: hovered ? path.accent : 'var(--text-secondary)' }}
        >
          Start path →
        </span>
      </div>
    </div>
  );
}

/* ─── Paths Section ──────────────────────────────────────────── */
function PathsSection() {
  return (
    <section
      id="paths"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-24"
    >
      <div className="text-center mb-16">
        <div
          className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
          style={{
            background: 'rgba(248,152,32,0.1)',
            color: 'var(--accent-java)',
            border: '1px solid rgba(248,152,32,0.2)',
          }}
        >
          LEARNING PATHS
        </div>
        <h2
          className="text-4xl font-extrabold mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Choose Your Path
        </h2>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          7 structured learning tracks. Each topic taught across 6 layers — from WHY to production
          usage to interview prep. Nothing skipped.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {LEARNING_PATHS.map((path) => (
          <PathCard key={path.slug} path={path} />
        ))}
      </div>
    </section>
  );
}

/* ─── Features Section ───────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24"
      style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-extrabold mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Everything You Need to Go{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent-ai) 0%, var(--accent-kotlin) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Senior
            </span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Not just videos. Not just theory. A complete system to build real understanding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              id={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="rounded-xl p-6 transition-all duration-200"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 6-Layer Teaching Model Section ────────────────────────── */
function TeachingModelSection() {
  const layers = [
    { num: '01', label: 'WHY', desc: 'Why does this concept exist? What problem does it solve?', color: 'var(--accent-ai)' },
    { num: '02', label: 'THEORY', desc: 'Complete conceptual explanation with real analogies', color: 'var(--accent-kotlin)' },
    { num: '03', label: 'VISUAL', desc: 'Animated step-by-step visualization of algorithms and data flow', color: 'var(--accent-react)' },
    { num: '04', label: 'CODE', desc: 'Runnable code with inline comments, beginner → expert versions', color: 'var(--accent-java)' },
    { num: '05', label: 'REAL WORLD', desc: 'How this is used in production (e.g., HashMap in Spring Cache)', color: 'var(--accent-spring)' },
    { num: '06', label: 'INTERVIEW', desc: 'All question types: conceptual, coding, tricky edge cases', color: 'var(--accent-interview)' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
      <div className="text-center mb-16">
        <div
          className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
          style={{
            background: 'rgba(66,133,244,0.1)',
            color: 'var(--accent-ai)',
            border: '1px solid rgba(66,133,244,0.2)',
          }}
        >
          THE METHOD
        </div>
        <h2
          className="text-4xl font-extrabold mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          The 6-Layer Teaching Model
        </h2>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Every single topic is taught across all 6 layers. No exceptions.
          No "exercise for the reader." No skipping.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {layers.map((layer) => (
          <div
            key={layer.num}
            className="rounded-xl p-5 flex gap-4"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div
              className="text-2xl font-black shrink-0"
              style={{ fontFamily: 'var(--font-display)', color: layer.color, opacity: 0.3 }}
            >
              {layer.num}
            </div>
            <div>
              <div
                className="text-xs font-bold tracking-widest mb-1"
                style={{ color: layer.color }}
              >
                {layer.label}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {layer.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA Section ────────────────────────────────────────────── */
function CtaSection() {
  return (
    <section
      className="py-24"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, rgba(66,133,244,0.08) 0%, transparent 70%)',
        borderTop: '1px solid var(--border-default)',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2
          className="text-4xl sm:text-5xl font-extrabold mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Start Your Journey Today.
          <br />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.8em' }}>
            100% free. No credit card.
          </span>
        </h2>
        <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
          Join developers who chose depth over shortcuts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            id="cta-start"
            className="btn-primary text-base px-10 py-4"
          >
            Start Learning Free →
          </button>
          <button
            id="cta-github"
            className="btn-ghost text-base px-10 py-4"
          >
            ⭐ Star on GitHub
          </button>
        </div>

        <div className="mt-12 text-xs" style={{ color: 'var(--text-muted)' }}>
          Powered by Google Gemini AI · Hosted on Oracle Cloud Always Free · ₹0/month operating cost
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      className="py-10"
      style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          Dev<span style={{ color: 'var(--accent-java)' }}>Mastery</span>
        </div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          100% Free & Open Source · Apache 2.0 · Built with ☕ + 🌱
        </div>
        <div className="flex gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <a href="/paths" className="hover:text-white transition-colors">Paths</a>
          <a href="/api-docs" className="hover:text-white transition-colors">API</a>
          <a href="https://github.com" className="hover:text-white transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PathsSection />
        <TeachingModelSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
