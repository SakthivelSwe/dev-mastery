const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres' });
(async () => {
  await c.connect();
  const r = await c.query(`
    SELECT t.slug, t.level, t.order_index,
           COALESCE((SELECT COUNT(*) FROM lessons l WHERE l.topic_id = t.id),0) AS lessons
    FROM topics t
    JOIN learning_paths p ON p.id = t.path_id
    WHERE p.slug = 'java-mastery'
    ORDER BY t.order_index NULLS LAST, t.slug`);
  r.rows.forEach(x => console.log(String(x.order_index ?? '-').padStart(4), 'L'+x.level, String(x.lessons).padStart(2), x.slug));
  console.log('TOTAL:', r.rows.length);
  await c.end();
})();

