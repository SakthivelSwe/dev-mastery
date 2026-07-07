'use strict';
/**
 * Populate topics.tags from path slug + words in topic slug.
 *
 * Deterministic — no AI. Tag = lowercase kebab.
 *
 * Rules:
 *   1. Always include the primary path slug as a tag.
 *   2. Also include every cross-listed path slug (via topic_paths).
 *   3. Include informative slug tokens (skip glue words: 'and','or','in','of','to','vs','a','an','the').
 *   4. Expand common short tokens: 'js' → 'javascript', 'ts' → 'typescript', 'k8s' → 'kubernetes'.
 *   5. Dedupe + cap at 12 tags.
 *
 * Only writes when the computed tags differ from what's already stored.
 * Supports --dry-run.
 */
const { Client } = require('pg');
const CONN = process.env.SUPABASE_DB_URL || 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const DRY = process.argv.includes('--dry-run');

const GLUE = new Set(['a','an','the','and','or','in','of','to','on','at','for','vs','via','with','how','what','it','works','is','be','from','by']);
const EXPAND = { js: 'javascript', ts: 'typescript', k8s: 'kubernetes', pg: 'postgresql', ms: 'microservices', sd: 'system-design' };

function tokensFromSlug(slug) {
  return slug.split('-')
    .map(w => (EXPAND[w] || w).toLowerCase())
    .filter(w => w.length > 1 && !GLUE.has(w));
}

function sameTags(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every(x => s.has(x));
}

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();

  // For every published topic, compute tags
  const rows = await c.query(`
    SELECT t.id, t.slug, t.tags, lp.slug AS owner_path
    FROM topics t
    LEFT JOIN learning_paths lp ON lp.id = t.path_id
    WHERE t.is_published = true
    ORDER BY t.slug
  `);

  // Preload cross-listed paths per topic for efficiency
  const cross = await c.query(`
    SELECT tp.topic_id, lp.slug
    FROM topic_paths tp
    JOIN learning_paths lp ON lp.id = tp.path_id
  `);
  const byTopic = new Map();
  for (const r of cross.rows) {
    if (!byTopic.has(r.topic_id)) byTopic.set(r.topic_id, []);
    byTopic.get(r.topic_id).push(r.slug);
  }

  const plan = [];
  for (const row of rows.rows) {
    const tags = new Set();
    if (row.owner_path) tags.add(row.owner_path);
    for (const p of (byTopic.get(row.id) || [])) tags.add(p);
    for (const t of tokensFromSlug(row.slug)) tags.add(t);
    const arr = [...tags].slice(0, 12);
    if (!sameTags(row.tags || [], arr)) {
      plan.push({ id: row.id, slug: row.slug, tags: arr, was: (row.tags || []).length });
    }
  }

  console.log(`Planned tag updates: ${plan.length} / ${rows.rowCount}`);
  plan.slice(0, 8).forEach(p =>
    console.log(`  ${p.slug.padEnd(38)} (was:${p.was})  → [${p.tags.join(', ')}]`));
  if (plan.length > 8) console.log(`  ... and ${plan.length - 8} more`);

  if (DRY) { console.log('\n[dry-run] no writes'); await c.end(); return; }

  let done = 0;
  for (const p of plan) {
    await c.query(`UPDATE topics SET tags=$1, updated_at=now() WHERE id=$2`, [p.tags, p.id]);
    done++;
  }
  console.log(`\nUpdated ${done} topic tag arrays.`);
  await c.end();
})().catch(e => { console.error(e); process.exit(1); });

