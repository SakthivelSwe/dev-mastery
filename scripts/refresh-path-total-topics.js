'use strict';
const { Client } = require('pg');
const CONN = process.env.SUPABASE_DB_URL || 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();

  const r = await c.query(`
    UPDATE learning_paths lp
    SET total_topics = sub.n,
        updated_at   = now()
    FROM (
      SELECT tp.path_id, COUNT(*)::int AS n
      FROM topic_paths tp
      JOIN topics t ON t.id = tp.topic_id AND t.is_published = true
      GROUP BY tp.path_id
    ) sub
    WHERE lp.id = sub.path_id
      AND lp.total_topics IS DISTINCT FROM sub.n
    RETURNING lp.slug, lp.total_topics
  `);
  if (r.rowCount) console.table(r.rows);

  const all = await c.query(
    `SELECT slug, total_topics FROM learning_paths ORDER BY order_index`);
  console.log('\nAll learning paths after refresh:');
  console.table(all.rows);

  await c.end();
})().catch(e => { console.error(e); process.exit(1); });

