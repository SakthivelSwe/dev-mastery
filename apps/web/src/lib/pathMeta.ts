// ============================================================
// DevMastery — Path Metadata Registry
// Maps each path slug to visual identity (icon, color, description)
// Used across Dashboard, Sidebar, and Roadmap views
// ============================================================

export interface PathMeta {
  slug:        string;
  label:       string;
  emoji:       string;
  color:       string;        // CSS color or var()
  bgGradient:  string;        // Tailwind gradient classes
  description: string;
  group:       string;
}

export const PATH_META: Record<string, PathMeta> = {
  'java-mastery':        { slug: 'java-mastery',        label: 'Java Mastery',       emoji: '☕', color: '#F89820', bgGradient: 'from-amber-500/20 to-orange-500/10',    description: 'Core Java, JVM, Memory, Concurrency',     group: 'Backend' },
  'spring-boot':         { slug: 'spring-boot',         label: 'Spring Boot',        emoji: '🍃', color: '#6DB33F', bgGradient: 'from-green-500/20 to-emerald-500/10',  description: 'REST APIs, JPA, Security, Testing',        group: 'Backend' },
  'dsa':                 { slug: 'dsa',                  label: 'DSA & Algorithms',   emoji: '🌳', color: '#A371F7', bgGradient: 'from-purple-500/20 to-violet-500/10',  description: 'Arrays, Trees, Graphs, DP',                group: 'Algorithms' },
  'leetcode-patterns':   { slug: 'leetcode-patterns',   label: 'LeetCode Patterns',  emoji: '🧩', color: '#818CF8', bgGradient: 'from-indigo-500/20 to-blue-500/10',    description: '20 universal coding patterns',             group: 'Algorithms' },
  'javascript':          { slug: 'javascript',           label: 'JavaScript',         emoji: '⚡', color: '#F7DF1E', bgGradient: 'from-yellow-500/20 to-amber-500/10',   description: 'Engine internals, async, closures',        group: 'Frontend' },
  'typescript':          { slug: 'typescript',           label: 'TypeScript',         emoji: '🔷', color: '#3178C6', bgGradient: 'from-blue-600/20 to-cyan-500/10',      description: 'Generics, utility types, decorators',      group: 'Frontend' },
  'react':               { slug: 'react',                label: 'React',              emoji: '⚛️', color: '#61DAFB', bgGradient: 'from-cyan-500/20 to-sky-500/10',       description: 'Hooks, rendering, state, Next.js',         group: 'Frontend' },
  'angular':             { slug: 'angular',              label: 'Angular',            emoji: '🔴', color: '#DD0031', bgGradient: 'from-red-500/20 to-rose-500/10',       description: 'Components, RxJS, NgRx, testing',          group: 'Frontend' },
  'html':                { slug: 'html',                 label: 'HTML',               emoji: '🏗️', color: '#E34F26', bgGradient: 'from-orange-500/20 to-red-500/10',     description: 'Semantics, accessibility, forms',          group: 'Frontend' },
  'css':                 { slug: 'css',                  label: 'CSS',                emoji: '🎨', color: '#1572B6', bgGradient: 'from-blue-500/20 to-cyan-600/10',      description: 'Grid, Flexbox, animations, variables',     group: 'Frontend' },
  'design-system':       { slug: 'design-system',        label: 'Design Systems',     emoji: '🎯', color: '#7F52FF', bgGradient: 'from-violet-500/20 to-purple-500/10',  description: 'Tokens, components, Storybook',            group: 'Frontend' },
  'system-design':       { slug: 'system-design',        label: 'System Design',      emoji: '🏛️', color: '#F89820', bgGradient: 'from-amber-500/20 to-yellow-500/10',   description: 'HLD, distributed systems, case studies',   group: 'Architecture' },
  'software-architecture':{ slug: 'software-architecture', label: 'Architecture',    emoji: '🏗️', color: '#4285F4', bgGradient: 'from-blue-500/20 to-indigo-500/10',    description: 'Patterns, microservices, DDD',             group: 'Architecture' },
  'api-design':          { slug: 'api-design',           label: 'API Design',         emoji: '🔌', color: '#6DB33F', bgGradient: 'from-green-500/20 to-teal-500/10',    description: 'REST, GraphQL, gRPC, versioning',          group: 'Architecture' },
  'sql':                 { slug: 'sql',                  label: 'SQL',                emoji: '🗄️', color: '#00758F', bgGradient: 'from-teal-600/20 to-cyan-600/10',      description: 'Joins, indexes, transactions, tuning',     group: 'Databases' },
  'postgresql-dba':      { slug: 'postgresql-dba',       label: 'PostgreSQL DBA',     emoji: '🐘', color: '#336791', bgGradient: 'from-blue-700/20 to-indigo-600/10',    description: 'VACUUM, replication, partitioning',        group: 'Databases' },
  'mongodb':             { slug: 'mongodb',              label: 'MongoDB',            emoji: '🍃', color: '#4DB33D', bgGradient: 'from-green-600/20 to-emerald-600/10',  description: 'Documents, aggregation, sharding',         group: 'Databases' },
  'full-stack':          { slug: 'full-stack',           label: 'Full Stack',         emoji: '🚀', color: '#4285F4', bgGradient: 'from-blue-500/20 to-violet-500/10',    description: 'End-to-end application development',       group: 'Fullstack' },
};

export const ALL_PATH_SLUGS = Object.keys(PATH_META);
