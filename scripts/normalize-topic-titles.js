'use strict';
/**
 * Normalize topic titles.
 *
 * Strategy:
 *   1) Detect titles that were auto-generated from slug (Title Case of words).
 *   2) Re-generate the title from the slug applying:
 *        - Acronym uppercase dictionary  ("api" â†’ "API", "http" â†’ "HTTP", ...)
 *        - Ordinal glue words in lowercase ("and", "in", "of", "to", "vs", "or")
 *        - Special slug overrides for niche names (Next.js, Node.js, CI/CD, ...)
 *   3) Only UPDATE if the new title differs from the current title.
 *
 * No AI. Deterministic. Reversible via a --dry-run flag.
 */
const { Client } = require('pg');
const CONN = process.env.SUPABASE_DB_URL || 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const DRY = process.argv.includes('--dry-run');

// Words that must be UPPERCASE (acronyms, initialisms). Keep SINGULAR only
// (plural handling is done separately so "vms" â†’ "VMs" not "VMS").
const ACRONYMS = new Set([
  'api','http','https','html','css','sql','xml','json','yaml','toml','csv',
  'url','uri','dns','tcp','udp','ssh','ssl','tls','cdn','cli','gui','tui','ide',
  'dom','bom','vdom','jsx','tsx','ejs','svg','png','jpg','gif','mp4','pdf',
  'jvm','jdk','jre','jit','gc','npm','pnpm','orm','odm','sdk',
  'crud','rest','soap','rpc','wsdl','uuid','jwt','oauth','saml',
  'sso','mfa','2fa','xss','csrf','cors','ssrf','sqli','ddos','waf','vpn','pwa',
  'spa','ssr','ssg','isr','csr','fcp','lcp','fid','cls','ttfb','ttl','tps','qps',
  'mvp','mvc','mvvm','ddd','solid','kiss','dry','yagni','oop','aop',
  'aws','gcp','azure','ec2','s3','iam','rds','sqs','sns','ecs','eks',
  'ecr','vpc','elb','alb','nlb','rbac','abac','acl','ip','ipv4','ipv6','mac',
  'ux','ui','a11y','i18n','l10n','seo','otp','tdd','bdd','atdd',
  'io','nio','jpa','jpql','jdbc','jsp','ejb','jsf','jms','jndi','osgi','war','jar',
  'ram','cpu','gpu','ssd','hdd','usb','vm','db','nosql','olap','oltp',
  'etl','elt','iot','ml','ai','llm','nlp','ocr','ar','vr','cdc','sdlc','vcs','pr','mr',
  'lc','cdk','tsc','pcm','cbo','soc','wcag','fips','pci','gdpr','hipaa',
  'wal','mvcc','pitr','cte','ddl','dml','dcl','tcl','xhr','fp','sse','wss','ws','asgi','wsgi',
  'dp','bst','avl','lru','lfu','fifo','lifo','stl','abi','pdf','csv','tsv',
]);

// Words with mixed case (rendered as-is regardless of position)
const MIXED_CASE = {
  'graphql': 'GraphQL',
  'grpc':    'gRPC',
  'k8s':     'K8s',
  'html5':   'HTML5',
  'nodejs':  'Node.js',
  'nextjs':  'Next.js',
  'nuxtjs':  'Nuxt.js',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'mongodb': 'MongoDB',
  'postgresql': 'PostgreSQL',
  'mysql':   'MySQL',
  'redis':   'Redis',
  'kafka':   'Kafka',
  'github':  'GitHub',
  'gitlab':  'GitLab',
  'oauth2':  'OAuth 2',
  'nosql':   'NoSQL',
  'rxjs':    'RxJS',
  'ngrx':    'NgRx',
  'ajax':    'AJAX',
};

// Slug pieces that should render lowercase (glue words)
const GLUE = new Set(['and','or','in','of','on','to','for','the','a','an','at','vs','via','with']);

// Full-slug overrides for special-cased names
const OVERRIDES = {
  'nextjs':                    'Next.js',
  'nextjs-or-nuxt':            'Next.js or Nuxt',
  'nodejs':                    'Node.js',
  'nodejs-basics':             'Node.js Basics',
  'spring-boot-or-nodejs-backend': 'Spring Boot or Node.js Backend',
  'ci-cd-basics':              'CI/CD Basics',
  'ci-cd':                     'CI/CD',
  'docker-ci-cd':              'Docker CI/CD',
  'ts-intro':                  'TypeScript Intro',
  'js-intro':                  'JavaScript Intro',
  'jsx':                       'JSX',
  'tsx':                       'TSX',
  'html-intro':                'HTML Intro',
  'css-intro':                 'CSS Intro',
  'sql-intro':                 'SQL Intro',
  'bfs':                       'Breadth-First Search (BFS)',
  'dfs':                       'Depth-First Search (DFS)',
  'shortest-path-dijkstra':    "Dijkstra's Shortest Path",
  'topological-sort':          'Topological Sort',
  'ddl-basics':                'DDL Basics',
  'dml-basics':                'DML Basics',
  'arrays-in-js':              'Arrays in JavaScript',
  'objects-in-js':             'Objects in JavaScript',
  'strings-in-js':             'Strings in JavaScript',
  'arraylist-vs-linkedlist':   'ArrayList vs LinkedList',
  'orm-and-jpa':               'ORM and JPA',
  'react-or-angular-basics':   'React or Angular Basics',
  'react-or-angular-advanced': 'React or Angular Advanced',
  'angular-cdktesting':        'Angular CDK Testing',
  'angular-pwa':               'Angular PWA',
  'app-router':                'App Router',
  'json-and-rest':             'JSON and REST',
  'rest-principles':           'REST Principles',
  'rest-api-design':           'REST API Design',
  'select-deep':               'Advanced SELECT',
  'services-and-di':           'Services and DI',
  'dependency-injection':      'Dependency Injection',
  'solid-principles':          'SOLID Principles',
  'design-tokens':             'Design Tokens',
  'design-rate-limiter':       'Design a Rate Limiter',
  'design-url-shortener':      'Design a URL Shortener',
  'crud-operations':           'CRUD Operations',
  'accessibility-html':        'Accessibility (HTML)',
  'accessibility-react':       'Accessibility (React)',
  'accessibility-system':      'Accessibility (System)',
  'api-routes-next':           'API Routes (Next.js)',
  'arc42-documentation':       'arc42 Documentation',
  'directives-built-in':       'Built-in Directives',
  'dry-kiss-yagni':            'DRY, KISS, YAGNI',
  'k8s-ci-cd':                 'K8s CI/CD',
  'sd-api-gateway':            'System Design: API Gateway',
  'sd-back-of-envelope':       'System Design: Back-of-Envelope Estimation',
  'sd-cdn':                    'System Design: CDN',
  'sd-nosql-databases':        'System Design: NoSQL Databases',
  'sd-sql-databases':          'System Design: SQL Databases',
  'spread-and-rest':           'Spread and Rest',
  'xhr-and-ajax':              'XHR and AJAX',
  'oauth2-spring':             'OAuth 2 with Spring',
};

function titleCase(slug) {
  return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

function normalizeSlug(slug) {
  if (OVERRIDES[slug]) return OVERRIDES[slug];

  // "-in-js" / "-in-ts" â†’ "in JavaScript" / "in TypeScript"
  // Trailing "-js" / "-ts" (not part of "-in-js") â†’ " (JavaScript)" / " (TypeScript)"
  let suffix = '';
  let core = slug;
  if (/-in-js$/.test(core))      { core = core.replace(/-in-js$/, ''); suffix = ' in JavaScript'; }
  else if (/-in-ts$/.test(core)) { core = core.replace(/-in-ts$/, ''); suffix = ' in TypeScript'; }
  else if (/-js$/.test(core))    { core = core.replace(/-js$/, '');    suffix = ' (JavaScript)'; }
  else if (/-ts$/.test(core))    { core = core.replace(/-ts$/, '');    suffix = ' (TypeScript)'; }

  const parts = core.split('-');
  const out = parts.map((w, i) => {
    const lw = w.toLowerCase();
    if (MIXED_CASE[lw]) return MIXED_CASE[lw];
    if (ACRONYMS.has(lw)) return lw.toUpperCase();
    // Pluralised acronym: "vms" â†’ "VMs", "apis" â†’ "APIs", "dbs" â†’ "DBs"
    if (lw.endsWith('s') && lw.length > 2 && ACRONYMS.has(lw.slice(0, -1))) {
      return lw.slice(0, -1).toUpperCase() + 's';
    }
    if (i !== 0 && GLUE.has(lw)) return lw;
    return lw[0].toUpperCase() + lw.slice(1);
  });
  return (out.join(' ') + suffix)
    .replace(/\bJavascript\b/g, 'JavaScript')
    .replace(/\bTypescript\b/g, 'TypeScript');
}

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();

  const r = await c.query(`SELECT id, slug, title FROM topics WHERE is_published=true ORDER BY slug`);

  let toUpdate = 0, skipped = 0, sampleShown = 0;
  const updates = [];

  for (const row of r.rows) {
    const auto = titleCase(row.slug);
    const currentIsAuto = row.title === auto || row.title === row.slug;
    const newTitle = normalizeSlug(row.slug);

    // Update only when the CURRENT DB title is an auto-generated title-case
    // of the slug (or the raw slug itself). Never overwrite a richer manually-
    // authored title â€” even if we have an OVERRIDE for that slug.
    const shouldUpdate = currentIsAuto && newTitle !== row.title;

    if (shouldUpdate) {
      updates.push({ id: row.id, slug: row.slug, from: row.title, to: newTitle });
      toUpdate++;
    } else {
      skipped++;
    }
  }

  console.log(`\nTo update: ${toUpdate}  |  Skipped (already good or manual): ${skipped}`);
  console.log('\nSample of planned changes (first 25):');
  updates.slice(0, 25).forEach(u =>
    console.log(`  ${u.slug.padEnd(38)} "${u.from}"  â†’  "${u.to}"`));
  if (process.argv.includes('--full')) {
    console.log('\nFull list:');
    updates.forEach(u =>
      console.log(`  ${u.slug.padEnd(38)} "${u.from}"  â†’  "${u.to}"`));
  }

  if (DRY) {
    console.log('\n[dry-run] no DB writes');
  } else {
    let done = 0;
    for (const u of updates) {
      await c.query(`UPDATE topics SET title=$1, updated_at=now() WHERE id=$2`, [u.to, u.id]);
      done++;
    }
    console.log(`\nUpdated ${done} topic titles.`);
  }

  await c.end();
})().catch(e => { console.error(e); process.exit(1); });



