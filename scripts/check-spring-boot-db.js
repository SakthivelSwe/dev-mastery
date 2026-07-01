const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres' });
(async () => {
  await c.connect();
  const r = await c.query(`SELECT t.slug, COUNT(l.id)::int as lessons FROM topics t LEFT JOIN lessons l ON l.topic_id=t.id WHERE t.path_id=(SELECT id FROM learning_paths WHERE slug='spring-boot') GROUP BY t.slug ORDER BY lessons ASC, t.slug ASC`);
  console.log('Total topics in DB:', r.rows.length);
  const incomplete = r.rows.filter(x => x.lessons < 9);
  console.log('Incomplete (<9 lessons):', incomplete.length);
  incomplete.forEach(x => console.log(' ', x.slug, '=', x.lessons));
  const total = r.rows.reduce((s, x) => s + x.lessons, 0);
  console.log('Total lessons:', total);
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });

