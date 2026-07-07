'use strict';
/**
 * Sync topic titles from MDX frontmatter into the DB.
 *
 * Rule: prefer MDX frontmatter title UNLESS
 *   - MDX title is missing, OR
 *   - MDX title equals the raw slug (broken frontmatter), OR
 *   - MDX title is a naive title-cased version of the slug and the DB title
 *     is a richer normalized version (from normalize-topic-titles.js).
 *
 * Idempotent, supports --dry-run.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const CONN = process.env.SUPABASE_DB_URL || 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const CONTENT_ROOT = path.join(__dirname, '..', 'apps', 'web', 'content');
const DRY = process.argv.includes('--dry-run');

function parseFM(raw) {
  const fm = {};
  if (!raw.startsWith('---')) return fm;
  const end = raw.indexOf('---', 3);
  if (end < 0) return fm;
  for (const line of raw.substring(3, end).split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.substring(0, i).trim();
    let v = line.substring(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    fm[k] = v;
  }
  return fm;
}

function titleCase(slug) {
  return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();

  const paths = await c.query(`SELECT slug FROM learning_paths ORDER BY order_index`);
  const plan = [];

  for (const p of paths.rows) {
    const dir = path.join(CONTENT_ROOT, p.slug);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));

    for (const f of files) {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      const fm = parseFM(raw);
      const slug = (fm.slug || f.replace(/\.mdx$/, '')).trim();
      const mdxTitle = (fm.title || '').trim();
      if (!mdxTitle) continue;

      const dbRow = await c.query(
        `SELECT t.id, t.title, lp.slug AS owner
         FROM topics t LEFT JOIN learning_paths lp ON lp.id = t.path_id
         WHERE t.slug=$1`, [slug]);
      if (!dbRow.rowCount) continue;
      const { id, title: dbTitle, owner } = dbRow.rows[0];
      // Skip cross-listed MDX (folder != canonical owner) to avoid flip-flop
      // between path-specific titles.
      if (owner && owner !== p.slug) continue;
      if (mdxTitle === dbTitle) continue;

      // Skip if MDX is broken (title == raw slug)
      if (mdxTitle === slug) continue;

      // Skip if MDX is a naive title case (e.g., "Bfs", "Foo Bar") AND DB looks
      // like a richer normalized version.
      const naive = titleCase(slug);
      if (mdxTitle === naive && dbTitle !== naive && dbTitle.length >= naive.length) continue;

      plan.push({ id, slug, from: dbTitle, to: mdxTitle });
    }
  }

  console.log(`Planned updates: ${plan.length}`);
  plan.slice(0, 30).forEach(p =>
    console.log(`  ${p.slug.padEnd(38)} "${p.from}"  â†’  "${p.to}"`));
  if (plan.length > 30) console.log(`  ... and ${plan.length - 30} more`);

  if (DRY) { console.log('\n[dry-run] no writes'); await c.end(); return; }

  let done = 0;
  for (const p of plan) {
    await c.query(`UPDATE topics SET title=$1, updated_at=now() WHERE id=$2`, [p.to, p.id]);
    done++;
  }
  console.log(`\nUpdated ${done} topic titles from MDX frontmatter.`);
  await c.end();
})().catch(e => { console.error(e); process.exit(1); });



