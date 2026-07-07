'use strict';
/**
 * Fix MDX files where frontmatter `title:` is a raw slug (broken).
 * Copies the DB title into the MDX frontmatter.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const CONN = process.env.SUPABASE_DB_URL || 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const CONTENT_ROOT = path.join(__dirname, '..', 'apps', 'web', 'content');

function parseFM(raw) {
  const fm = {}; if (!raw.startsWith('---')) return fm;
  const end = raw.indexOf('---', 3); if (end < 0) return fm;
  for (const line of raw.substring(3, end).split('\n')) {
    const i = line.indexOf(':'); if (i < 0) continue;
    const k = line.substring(0, i).trim();
    let v = line.substring(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    fm[k] = v;
  }
  return fm;
}

function replaceFMTitle(raw, newTitle) {
  if (!raw.startsWith('---')) return raw;
  const end = raw.indexOf('---', 3);
  if (end < 0) return raw;
  const head = raw.substring(0, end);
  const tail = raw.substring(end);
  const escaped = newTitle.includes('"') ? `'${newTitle.replace(/'/g, "\\'")}'` : `"${newTitle}"`;
  if (/^\s*title\s*:/m.test(head)) {
    return head.replace(/^\s*title\s*:\s*[^\r\n]*$/m, `title: ${escaped}`) + tail;
  }
  return raw.replace(/^---\r?\n/, `---\ntitle: ${escaped}\n`);
}

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();
  const paths = await c.query(`SELECT slug FROM learning_paths ORDER BY order_index`);
  let fixed = 0;
  for (const p of paths.rows) {
    const dir = path.join(CONTENT_ROOT, p.slug);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.mdx'))) {
      const file = path.join(dir, f);
      const raw = fs.readFileSync(file, 'utf-8');
      const fm = parseFM(raw);
      const slug = (fm.slug || f.replace(/\.mdx$/, '')).trim();
      const mdxTitle = (fm.title || '').trim();
      // Broken frontmatter: title is missing OR literally equals the slug
      if (!mdxTitle || mdxTitle === slug) {
        const db = await c.query(`SELECT title FROM topics WHERE slug=$1`, [slug]);
        if (!db.rowCount) continue;
        const rewritten = replaceFMTitle(raw, db.rows[0].title);
        if (rewritten !== raw) {
          fs.writeFileSync(file, rewritten, 'utf-8');
          console.log(`  [${p.slug}] ${f}  title â†’ "${db.rows[0].title}"`);
          fixed++;
        }
      }
    }
  }
  console.log(`Fixed ${fixed} MDX files.`);
  await c.end();
})();

