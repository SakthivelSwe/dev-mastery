// Quick DB probe for projects path content status.
const { Client } = require('pg');
const CONN = 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();

  const p = await c.query("SELECT id, slug, title FROM learning_paths WHERE slug='projects'");
  console.log('Learning path row:', p.rows.length ? p.rows[0] : 'MISSING');

  const t = await c.query(`
    SELECT slug, is_published
    FROM topics
    WHERE path_id = (SELECT id FROM learning_paths WHERE slug='projects')
    ORDER BY order_index
  `);
  console.log(`\nRegistered topic rows: ${t.rows.length}`);
  for (const r of t.rows) console.log(`  ${r.slug.padEnd(30)} ${r.is_published ? 'published' : 'draft'}`);

  const l = await c.query(`
    SELECT t.slug, COUNT(l.id)::int AS sections
    FROM topics t
    LEFT JOIN lessons l ON l.topic_id = t.id
    WHERE t.path_id = (SELECT id FROM learning_paths WHERE slug='projects')
    GROUP BY t.slug
    ORDER BY t.slug
  `);
  console.log('\nSection counts per topic:');
  for (const r of l.rows) console.log(`  ${r.slug.padEnd(30)} ${r.sections} sections`);

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });

