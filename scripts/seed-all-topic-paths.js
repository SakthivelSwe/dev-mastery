'use strict';
/**
 * Cross-list every MDX file under apps/web/content/<path> into topic_paths
 * for that path. Idempotent (ON CONFLICT DO NOTHING). Skips MDX files whose
 * slug has no matching topics row.
 *
 * Generalises scripts/seed-fullstack-topic-paths.js to all paths.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const CONN = process.env.SUPABASE_DB_URL || 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const CONTENT_ROOT = path.join(__dirname, '..', 'apps', 'web', 'content');

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

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();

  const paths = await c.query(`SELECT id, slug FROM learning_paths ORDER BY order_index`);

  let grandInserted = 0, grandSkipped = 0, grandMissing = 0;

  for (const p of paths.rows) {
    const dir = path.join(CONTENT_ROOT, p.slug);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx')).sort();

    // Current max display_order for this path so we don't collide
    const maxRow = await c.query(
      `SELECT COALESCE(MAX(display_order), 0) AS max FROM topic_paths WHERE path_id=$1`, [p.id]);
    let baseOrder = maxRow.rows[0].max || 0;

    let ins = 0, exists = 0, miss = 0;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      const fm = parseFrontmatter(raw);
      const slug = (fm.slug || f.replace(/\.mdx$/, '')).trim();
      const level = parseInt(fm.level, 10) || 1;

      const tr = await c.query(`SELECT id FROM topics WHERE slug=$1`, [slug]);
      if (!tr.rows.length) { miss++; continue; }
      const topicId = tr.rows[0].id;

      const displayOrder = baseOrder + i + 1;
      const r = await c.query(
        `INSERT INTO topic_paths (topic_id, path_id, display_order, level_override)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (topic_id, path_id) DO NOTHING`,
        [topicId, p.id, displayOrder, level]);
      if (r.rowCount === 1) ins++; else exists++;
    }

    console.log(`${p.slug.padEnd(24)} inserted=${String(ins).padStart(3)}  already=${String(exists).padStart(3)}  missing-row=${miss}`);
    grandInserted += ins; grandSkipped += exists; grandMissing += miss;
  }

  console.log(`\nTOTAL   inserted=${grandInserted}  already=${grandSkipped}  missing-row=${grandMissing}`);

  await c.end();
})().catch(e => { console.error(e); process.exit(1); });

