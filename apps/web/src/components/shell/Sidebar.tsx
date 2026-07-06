'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Coffee, GitBranch, Database, Layout, Code2, Server, Cpu,
  Globe, Layers, Shield, BookOpen, ChevronDown, ChevronRight,
  Menu, X, Zap, BarChart3, FileCode, Terminal, Network, PenTool, Box,
  Award, FlaskConical, MessageSquare, Cog
} from 'lucide-react';

// ─── Path Configuration ───────────────────────────────────────

interface PathConfig {
  slug:   string;
  label:  string;
  icon:   React.ReactNode;
  color:  string;
  group:  string;
  /** Optional href override — by default a path opens its roadmap. */
  href?:  string;
}

const PATHS: PathConfig[] = [
  // Backend
  { slug: 'java-mastery',       label: 'Java Mastery',         icon: <Coffee size={16} />,   color: 'var(--accent-java)',    group: 'Backend' },
  { slug: 'spring-boot',        label: 'Spring Boot',          icon: <Server size={16} />,   color: 'var(--accent-spring)',  group: 'Backend' },
  { slug: 'microservices',      label: 'Microservices',        icon: <Network size={16} />,  color: 'var(--accent-spring)',  group: 'Backend' },
  // Algorithms
  { slug: 'dsa',                label: 'DSA & Algorithms',     icon: <GitBranch size={16} />, color: 'var(--accent-dsa)',    group: 'Algorithms' },
  // LeetCode Patterns is a dedicated page (not a learning-path roadmap)
  { slug: 'leetcode-patterns',  label: 'LeetCode Patterns',    icon: <Cpu size={16} />,      color: 'var(--accent-dsa)',     group: 'Algorithms', href: '/patterns' },
  // Frontend
  { slug: 'javascript',         label: 'JavaScript',           icon: <FileCode size={16} />, color: '#F7DF1E',               group: 'Frontend' },
  { slug: 'typescript',         label: 'TypeScript',           icon: <Code2 size={16} />,    color: '#3178C6',               group: 'Frontend' },
  { slug: 'react',              label: 'React',                icon: <Globe size={16} />,    color: 'var(--accent-react)',   group: 'Frontend' },
  { slug: 'angular',            label: 'Angular',              icon: <Layers size={16} />,   color: 'var(--accent-angular)', group: 'Frontend' },
  { slug: 'html',               label: 'HTML',                 icon: <Layout size={16} />,   color: '#E34F26',               group: 'Frontend' },
  { slug: 'css',                label: 'CSS',                  icon: <PenTool size={16} />,  color: '#1572B6',               group: 'Frontend' },
  { slug: 'design-system',      label: 'Design Systems',       icon: <Box size={16} />,      color: 'var(--accent-kotlin)',  group: 'Frontend' },
  // Architecture
  { slug: 'system-design',      label: 'System Design',        icon: <Network size={16} />,  color: 'var(--accent-system)',  group: 'Architecture' },
  { slug: 'software-architecture', label: 'Architecture',      icon: <BarChart3 size={16} />, color: 'var(--accent-ai)',    group: 'Architecture' },
  { slug: 'api-design',         label: 'API Design',           icon: <Terminal size={16} />, color: 'var(--accent-spring)',  group: 'Architecture' },
  // Databases
  { slug: 'sql',                label: 'SQL',                  icon: <Database size={16} />, color: '#00758F',               group: 'Databases' },
  { slug: 'postgresql-dba',     label: 'PostgreSQL DBA',       icon: <Shield size={16} />,   color: '#336791',               group: 'Databases' },
  { slug: 'mongodb',            label: 'MongoDB',              icon: <Database size={16} />, color: '#4DB33D',               group: 'Databases' },
  // Fullstack
  { slug: 'full-stack',         label: 'Full Stack',           icon: <BookOpen size={16} />, color: 'var(--accent-ai)',      group: 'Fullstack' },
  // Real-World Projects (capstone builds — all 10 projects, 100/100 content-health)
  { slug: 'projects',           label: 'Real-World Projects',  icon: <FlaskConical size={16} />, color: '#F97316',         group: 'Projects' },
];

const GROUPS = ['Backend', 'Algorithms', 'Frontend', 'Architecture', 'Databases', 'Fullstack', 'Projects'];

// ─── Sidebar Component ───────────────────────────────────────

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Backend: true, Algorithms: true, Frontend: false,
    Architecture: false, Databases: false, Fullstack: false,
  });

  // Auto-expand the group that contains the current path
  useEffect(() => {
    const currentPath = PATHS.find(p => pathname.includes(`/learn/${p.slug}`));
    if (currentPath) {
      setOpenGroups(prev => ({ ...prev, [currentPath.group]: true }));
    }
  }, [pathname]);

  const toggleGroup = (group: string) =>
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));

  return (
    <aside
      className={`
        flex flex-col border-r transition-all duration-300 shrink-0
        ${collapsed ? 'w-14' : 'w-56'}
        ${className}
      `}
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      {/* Sidebar Header — matches Topbar height (h-14) */}
      <div
        className="h-14 flex items-center justify-between px-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-default)' }}
      >
        {!collapsed && (
          <span
            className="text-[11px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Paths
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md ml-auto transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-elevated)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {GROUPS.map(group => {
          const groupPaths = PATHS.filter(p => p.group === group);
          const isOpen = openGroups[group];

          return (
            <div key={group} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold tracking-widest uppercase transition-colors rounded"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {group}
                  {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                </button>
              )}

              {(isOpen || collapsed) && (
                <div className="mt-0.5 space-y-0.5">
                  {groupPaths.map(path => {
                    const targetHref = path.href ?? `/learn/${path.slug}/roadmap`;
                    const isActive = path.href
                      ? pathname.startsWith(path.href)
                      : pathname.includes(`/learn/${path.slug}`);
                    return (
                      <Link
                        key={path.slug}
                        href={targetHref}
                        title={path.label}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] transition-all duration-150 group"
                        style={{
                          background: isActive ? 'var(--bg-elevated)' : 'transparent',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: isActive ? 500 : 400,
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'var(--bg-elevated)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        <span
                          className="shrink-0"
                          style={{ color: isActive ? path.color : 'var(--text-muted)' }}
                        >
                          {path.icon}
                        </span>
                        {!collapsed && <span className="truncate">{path.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div
          className="p-2.5 border-t shrink-0"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Zap size={13} style={{ color: 'var(--accent)' }} className="shrink-0" />
            <span>Open dashboard</span>
          </Link>
          <Link
            href="/review"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <FlaskConical size={13} className="shrink-0" style={{ color: '#6366f1' }} />
            <span>Spaced Review</span>
          </Link>
          <Link
            href="/interview"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <MessageSquare size={13} className="shrink-0" style={{ color: '#10b981' }} />
            <span>Mock Interview</span>
          </Link>
          <Link
            href="/system-design/studio"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Cog size={13} className="shrink-0" style={{ color: '#f97316' }} />
            <span>Design Studio</span>
          </Link>
          <Link
            href="/profile/certificates"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Award size={13} className="shrink-0" style={{ color: '#eab308' }} />
            <span>My Certificates</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
