const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres' });
(async () => {
  await c.connect();
  const lp = await c.query(`SELECT id, slug, title FROM learning_paths WHERE slug='microservices'`);
  console.log('Path:', lp.rows[0]);
  const topicsCols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='topics'`);
  console.log('topics columns:', topicsCols.rows.map(r => r.column_name).join(', '));
  const topics = await c.query(`SELECT t.slug, t.title, COUNT(l.id)::int as lessons FROM topics t LEFT JOIN lessons l ON l.topic_id=t.id WHERE t.path_id=$1 GROUP BY t.id, t.slug, t.title ORDER BY t.slug ASC`, [lp.rows[0].id]);
  console.log('\nTopics (' + topics.rows.length + '):');
  topics.rows.forEach(t => console.log(' ', t.slug, '|', t.title, '|', t.lessons, 'lessons'));
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });

