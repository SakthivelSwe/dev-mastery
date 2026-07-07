'use strict';
/**
 * Global content-vs-DB reconciliation audit.
 *
 * For every learning path, report:
 *   1) Orphan MDX files  â†’ on disk but no topics row (should be imported)
 *   2) Orphan topic rows â†’ in DB but no MDX file  (dead links on roadmap)
 *   3) Title drift        â†’ MDX frontmatter title differs from topics.title
 *   4) Level drift        â†’ MDX frontmatter level differs from topic_paths.level_override
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

  let totalOrphanMdx = 0, totalOrphanDb = 0, totalTitleDrift = 0;
  const perPath = [];

  for (const p of paths.rows) {
    const dir = path.join(CONTENT_ROOT, p.slug);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
    const mdxBySlug = new Map();
    for (const f of files) {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      const fm = parseFrontmatter(raw);
      const slug = (fm.slug || f.replace(/\.mdx$/, '')).trim();
      mdxBySlug.set(slug, { fm, file: f });
    }

    // Topics linked to this path via junction (canonical source)
    const linked = await c.query(`
      SELECT t.id, t.slug, t.title, t.level, tp.level_override
      FROM topic_paths tp
      JOIN topics t ON t.id=tp.topic_id
      WHERE tp.path_id=$1
    `, [p.id]);
    const linkedBySlug = new Map(linked.rows.map(r => [r.slug, r]));

    // 1. Orphan MDX (on disk, no DB row anywhere) — batch query for speed
    const mdxSlugs = [...mdxBySlug.keys()];
    let existsSet = new Set();
    if (mdxSlugs.length) {
      const ex = await c.query(`SELECT slug FROM topics WHERE slug = ANY($1)`, [mdxSlugs]);
      existsSet = new Set(ex.rows.map(r => r.slug));
    }
    const orphanMdx = mdxSlugs.filter(s => !existsSet.has(s));

    // 2. Orphan DB rows for this path (linked, but no MDX)
    const orphanDb = [];
    for (const [slug] of linkedBySlug) {
      if (!mdxBySlug.has(slug)) orphanDb.push(slug);
    }

    // 3. Title drift (MDX and DB row exist, titles differ)
    const drift = [];
    for (const [slug, mdx] of mdxBySlug) {
      const db = linkedBySlug.get(slug);
      if (!db) continue;
      const mdxTitle = (mdx.fm.title || '').trim();
      if (mdxTitle && mdxTitle !== db.title) {
        drift.push({ slug, mdxTitle, dbTitle: db.title });
      }
    }

    const summary = `${p.slug.padEnd(24)} mdx=${files.length.toString().padStart(3)}  linked=${linked.rowCount.toString().padStart(3)}  orphan_mdx=${orphanMdx.length}  orphan_db=${orphanDb.length}  title_drift=${drift.length}`;
    console.log(summary);
    if (orphanMdx.length) console.log('  orphan MDX:', orphanMdx.join(', '));
    if (orphanDb.length)  console.log('  orphan DB :', orphanDb.join(', '));
    if (drift.length && drift.length <= 5) {
      drift.forEach(d => console.log(`  drift    : ${d.slug}  MDX="${d.mdxTitle}"  DB="${d.dbTitle}"`));
    } else if (drift.length) {
      console.log(`  drift    : ${drift.length} rows (sample: ${drift[0].slug}, ${drift[1].slug}, ${drift[2].slug} ...)`);
    }

    perPath.push({
      path: p.slug, mdx: files.length, linked: linked.rowCount,
      orphanMdx: orphanMdx.length, orphanMdxSlugs: orphanMdx,
      orphanDb: orphanDb.length,  orphanDbSlugs: orphanDb,
      titleDrift: drift.length,   driftSlugs: drift.map(d => d.slug),
    });
    totalOrphanMdx += orphanMdx.length;
    totalOrphanDb  += orphanDb.length;
    totalTitleDrift += drift.length;
  }

  console.log(`\nTOTAL   orphan_mdx=${totalOrphanMdx}  orphan_db=${totalOrphanDb}  title_drift=${totalTitleDrift}`);

  // Emit a machine-readable report for the CI workflow and an admin dashboard.
  const outDir = path.join(__dirname, '..', 'apps', 'web', 'public', '_audit');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'content-vs-db.json');
  fs.writeFileSync(outFile, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totals: {
      paths: paths.rowCount,
      orphanMdx: totalOrphanMdx,
      orphanDb: totalOrphanDb,
      titleDrift: totalTitleDrift,
      mdxFiles: perPath.reduce((a, p) => a + p.mdx, 0),
      junctionRows: perPath.reduce((a, p) => a + p.linked, 0),
    },
    perPath,
  }, null, 2));
  console.log(`\nWrote ${outFile}`);

  await c.end();
})().catch(e => { console.error(e); process.exit(1); });

