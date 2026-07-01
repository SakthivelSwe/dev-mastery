const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});
(async () => {
  await client.connect();
  const r1 = await client.query("SELECT DISTINCT section_type FROM lessons ORDER BY section_type");
  console.log('section_type values:', r1.rows.map(r=>r.section_type));
  const r2 = await client.query("SELECT t.slug, COUNT(l.id) AS lessons FROM topics t LEFT JOIN lessons l ON l.topic_id=t.id WHERE t.slug IN ('iterator-pattern','garbage-collection-mechanics') GROUP BY t.slug");
  console.log('rows:', r2.rows);
  const r3 = await client.query("SELECT id, slug, title FROM topics WHERE slug IN ('iterator-pattern','garbage-collection-mechanics')");
  console.log('topic rows:', r3.rows);
  const r4 = await client.query("SELECT t.slug, COUNT(*) AS lessons_count FROM topics t LEFT JOIN lessons l ON l.topic_id=t.id WHERE t.slug='polymorphism' GROUP BY t.slug");
  console.log('polymorphism:', r4.rows);
  const r5 = await client.query("SELECT section_type, length(content_mdx) AS len FROM lessons l JOIN topics t ON t.id=l.topic_id WHERE t.slug='polymorphism' ORDER BY order_index");
  console.log('polymorphism lessons:', r5.rows);
  await client.end();
})();

