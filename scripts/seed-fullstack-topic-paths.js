/*
 * Seed topic_paths for the "full-stack" learning path.
 *
 * Why: apps/web/content/full-stack/ has 93 MDX files, but 51 slugs are owned by
 * other paths (java-mastery, dsa, javascript, react, …). The `topics` table has
 * a UNIQUE slug + single path_id, so the roadmap shows only 42/93. This script
 * cross-lists all 93 through the new `topic_paths` junction table.
 *
 * Idempotent: uses ON CONFLICT DO NOTHING.
 *
 * Usage:
 *   node scripts/seed-fullstack-topic-paths.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { Client } = require('pg');

const CONN =
  'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';

const CONTENT_DIR = path.join(__dirname, '..', 'apps', 'web', 'content', 'full-stack');

function parseFrontmatter(raw) {
  const fm = {};
  if (!raw.startsWith('---')) return fm;
  const end = raw.indexOf('---', 3);
  if (end < 0) return fm;
  for (const line of raw.substring(3, end).split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.substring(0, i).trim();
    let v = line.substring(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    fm[k] = v;
  }
  return fm;
}

async function ensureJunctionTable(c) {
  await c.query(`
    CREATE TABLE IF NOT EXISTS topic_paths (
      topic_id       uuid NOT NULL REFERENCES topics(id)         ON DELETE CASCADE,
      path_id        uuid NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
      display_order  int,
      level_override int,
      created_at     timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (topic_id, path_id)
    );
  `);
  await c.query(`CREATE INDEX IF NOT EXISTS idx_topic_paths_path  ON topic_paths (path_id);`);
  await c.query(`CREATE INDEX IF NOT EXISTS idx_topic_paths_topic ON topic_paths (topic_id);`);

  // Backfill single-owner mirrors for every existing topic
  const backfill = await c.query(`
    INSERT INTO topic_paths (topic_id, path_id, display_order, level_override)
    SELECT t.id, t.path_id, t.order_index, t.level
    FROM topics t
    WHERE t.path_id IS NOT NULL
    ON CONFLICT (topic_id, path_id) DO NOTHING
    RETURNING topic_id
  `);
  console.log(`  backfilled ${backfill.rowCount} single-owner mirror rows`);
}

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();

  console.log('>> ensuring topic_paths junction exists');
  await ensureJunctionTable(c);

  const pr = await c.query(`SELECT id FROM learning_paths WHERE slug='full-stack'`);
  if (!pr.rows.length) throw new Error('learning_paths row for full-stack missing');
  const fullStackId = pr.rows[0].id;

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx')).sort();
  console.log(`>> ${files.length} MDX files found in content/full-stack`);

  // Collect (slug, level, order) for every MDX
  const items = files.map((f, idx) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf-8');
    const fm  = parseFrontmatter(raw);
    return {
      slug:  (fm.slug || f.replace(/\.mdx$/, '')).trim(),
      level: parseInt(fm.level, 10) || 1,
      order: idx + 1,
    };
  });

  // Determine current max display_order under full-stack so we don't collide
  const maxRow = await c.query(
    `SELECT COALESCE(MAX(display_order), 0) AS max FROM topic_paths WHERE path_id=$1`,
    [fullStackId]
  );
  let baseOrder = maxRow.rows[0].max || 0;

  let inserted = 0, skippedMissing = 0, alreadyLinked = 0;
  for (const it of items) {
    const tr = await c.query(`SELECT id, path_id FROM topics WHERE slug=$1`, [it.slug]);
    if (!tr.rows.length) {
      console.warn(`  MISS  ${it.slug}  (no topics row — content not yet imported)`);
      skippedMissing++;
      continue;
    }
    const topicId = tr.rows[0].id;

    // If it's already the primary owner of full-stack, ensure junction row exists (backfill did it)
    // Otherwise insert a cross-listing row.
    const displayOrder = baseOrder + it.order;
    const ins = await c.query(
      `INSERT INTO topic_paths (topic_id, path_id, display_order, level_override)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (topic_id, path_id) DO NOTHING`,
      [topicId, fullStackId, displayOrder, it.level]
    );
    if (ins.rowCount === 1) inserted++;
    else alreadyLinked++;
  }

  const total = await c.query(
    `SELECT COUNT(*) FROM topic_paths WHERE path_id=$1`, [fullStackId]
  );
  console.log(`\n>> full-stack topic_paths rows: ${total.rows[0].count}`);
  console.log(`   inserted:       ${inserted}`);
  console.log(`   already linked: ${alreadyLinked}`);
  console.log(`   missing topics: ${skippedMissing}`);

  await c.end();
})().catch(e => { console.error(e); process.exit(1); });


