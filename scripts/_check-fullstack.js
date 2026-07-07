const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const CONN = 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();
  const p = await c.query("SELECT id, slug FROM learning_paths WHERE slug='full-stack'");
  console.log('path row:', p.rows[0]);
  const pid = p.rows[0].id;

  const own = await c.query('SELECT slug FROM topics WHERE path_id=$1 ORDER BY slug', [pid]);
  console.log('topics owned by full-stack:', own.rows.length);

  const dir = path.join(__dirname, '..', 'apps', 'web', 'content', 'full-stack');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
  console.log('MDX files:', files.length);
  const mdxSlugs = files.map(f => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
    const m = raw.match(/^slug:\s*"?([^"\n]+)"?/m);
    return m ? m[1].trim() : f.replace(/\.mdx$/, '');
  });

  const ownSet = new Set(own.rows.map(r => r.slug));
  const notInDbUnderFullStack = mdxSlugs.filter(s => !ownSet.has(s));
  console.log('\nMDX slugs NOT under full-stack in DB:', notInDbUnderFullStack.length);

  // Check where these belong currently
  const other = await c.query(
    `SELECT t.slug, lp.slug AS path
     FROM topics t JOIN learning_paths lp ON lp.id=t.path_id
     WHERE t.slug = ANY($1::text[])`,
    [notInDbUnderFullStack]
  );
  const byPath = {};
  for (const r of other.rows) {
    byPath[r.path] = (byPath[r.path] || 0) + 1;
  }
  console.log('their current paths:', byPath);
  const inDbSlugs = new Set(other.rows.map(r => r.slug));
  const missingEntirely = notInDbUnderFullStack.filter(s => !inDbSlugs.has(s));
  console.log('completely missing from DB:', missingEntirely.length);
  if (missingEntirely.length) console.log(missingEntirely);

  // Show sample cross-listed ones
  console.log('\nSample cross-listed (first 10):');
  console.log(other.rows.slice(0, 10));

  await c.end();
})().catch(e => { console.error(e); process.exit(1); });

