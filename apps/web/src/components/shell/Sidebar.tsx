'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Coffee, GitBranch, Database, Layout, Code2, Server, Cpu,
  Globe, Layers, Shield, BookOpen, ChevronDown, ChevronRight,
  Menu, X, Zap, BarChart3, FileCode, Terminal, Network, PenTool, Box
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
];

const GROUPS = ['Backend', 'Algorithms', 'Frontend', 'Architecture', 'Databases', 'Fullstack'];

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
        flex flex-col border-r border-[--border-default] bg-[--bg-surface] transition-all duration-300 shrink-0
        ${collapsed ? 'w-14' : 'w-56'}
        ${className}
      `}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-[--border-default] shrink-0">
        {!collapsed && (
          <Link href="/" className="font-display font-bold text-base text-[--text-primary] tracking-tight">
            Dev<span className="text-[--accent-ai]">Mastery</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-elevated] transition-all ml-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
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
                  className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold tracking-widest text-[--text-muted] uppercase hover:text-[--text-secondary] transition-colors rounded"
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
                        className={`
                          flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-all duration-150 group
                          ${isActive
                            ? 'bg-[--bg-elevated] text-[--text-primary] font-medium'
                            : 'text-[--text-secondary] hover:bg-[--bg-elevated]/60 hover:text-[--text-primary]'}
                        `}
                        style={isActive ? { borderLeft: `3px solid ${path.color}`, paddingLeft: '9px' } : {}}
                      >
                        <span style={{ color: isActive ? path.color : 'currentColor' }} className="shrink-0 transition-colors group-hover:text-inherit">
                          {path.icon}
                        </span>
                        {!collapsed && (
                          <span className="truncate text-[13px]">{path.label}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer — XP / Streak teaser */}
      {!collapsed && (
        <div className="p-3 border-t border-[--border-default] shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[--bg-elevated] hover:bg-[--border-default] transition-colors text-sm"
          >
            <Zap size={15} className="text-[--accent-java] shrink-0" />
            <span className="text-[--text-secondary] text-xs">View Dashboard</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
