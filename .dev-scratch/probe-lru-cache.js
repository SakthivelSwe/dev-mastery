// Full section dump for one project to verify content quality end-to-end.
const { Client } = require('pg');
const CONN = 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();
  const r = await c.query(`
    SELECT section_type, LENGTH(content_mdx) AS chars,
           SUBSTRING(content_mdx, 1, 60) AS preview
    FROM lessons
    WHERE topic_id = (SELECT id FROM topics WHERE slug='project-lru-cache')
    ORDER BY order_index
  `);
  console.log('project-lru-cache sections in DB:');
  for (const row of r.rows) {
    console.log(`  ${row.section_type.padEnd(14)} ${String(row.chars).padStart(5)} chars   ${row.preview.replace(/\n/g, ' ')}...`);
  }
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });

