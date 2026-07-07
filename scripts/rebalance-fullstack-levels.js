'use strict';
/**
 * Rebalance full-stack level distribution.
 *
 * The bottom 53 topics were cross-listed via seed-all-topic-paths.js which
 * defaulted level_override to fm.level from the full-stack MDX frontmatter
 * (mostly 1). That collapsed them all into Level 1.
 *
 * Fix: for every topic linked to full-stack, set level_override to the
 * canonical topics.level from the home path. This gives a natural pyramid
 * because the home paths already have healthy L1..L5 distributions.
 *
 * Overrides the initial 40 curated topics too â€” but the curated levels were
 * already close to the canonical levels, so this is a net improvement.
 * If any override is worse, we can pin specific slugs afterwards.
 */
const { Client } = require('pg');
const CONN = process.env.SUPABASE_DB_URL || 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';

// A few slugs where the curated full-stack level is deliberately different
// from the home-path level (broader-tour ordering). Preserve these.
const PIN = {
  'internet-how-it-works': 1,
  'what-is-http': 1,
  'browsers-and-how-they-work': 1,
  'dns-and-how-it-works': 1,
  'what-is-a-domain-name': 1,
  'what-is-hosting': 1,
  'terminal-basics': 1,
  'version-control-basics': 1,
  'html-basics': 2,
  'css-basics': 2,
  'javascript-basics': 2,
  'npm-and-package-managers': 2,
  'module-bundlers': 2,
  'browser-devtools': 2,
  'fetch-and-xhr': 2,
  'json-and-rest': 2,
  'react-or-angular-basics': 3,
  'typescript-basics': 3,
  'nodejs-basics': 3,
  'databases-intro': 3,
  'rest-api-design': 3,
  'authentication-basics': 3,
  'git-workflow': 3,
  'docker-basics': 3,
  'react-or-angular-advanced': 4,
  'nextjs-or-nuxt': 4,
  'spring-boot-or-nodejs-backend': 4,
  'orm-and-jpa': 4,
  'database-design': 4,
  'api-security': 4,
  'ci-cd-basics': 4,
  'cloud-basics': 4,
  'microservices-architecture': 5,
  'message-queues': 5,
  'caching-strategies': 5,
  'container-orchestration': 5,
  'monitoring-and-logging': 5,
  'performance-optimization': 5,
  'web-security-advanced': 5,
  'system-design-basics': 5,
};

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();

  const fsRow = await c.query(`SELECT id FROM learning_paths WHERE slug='full-stack'`);
  const fsId = fsRow.rows[0].id;

  const rows = await c.query(`
    SELECT tp.topic_id AS id, t.slug, t.level AS canonical
    FROM topic_paths tp
    JOIN topics t ON t.id = tp.topic_id AND t.is_published = true
    WHERE tp.path_id = $1
  `, [fsId]);

  let updated = 0, kept = 0;
  for (const r of rows.rows) {
    const desired = PIN[r.slug] ?? r.canonical;
    const u = await c.query(
      `UPDATE topic_paths
       SET level_override = $1
       WHERE topic_id = $2 AND path_id = $3
         AND (level_override IS DISTINCT FROM $1)`,
      [desired, r.id, fsId]);
    if (u.rowCount) updated++; else kept++;
  }
  console.log(`updated=${updated}  unchanged=${kept}`);

  // Report new distribution
  const dist = await c.query(`
    SELECT COALESCE(tp.level_override, t.level) AS lvl, COUNT(*)::int AS n
    FROM topic_paths tp
    JOIN topics t ON t.id=tp.topic_id AND t.is_published=true
    WHERE tp.path_id=$1
    GROUP BY 1 ORDER BY 1
  `, [fsId]);
  console.log('\nfull-stack after rebalance:');
  console.table(dist.rows);

  await c.end();
})().catch(e => { console.error(e); process.exit(1); });

