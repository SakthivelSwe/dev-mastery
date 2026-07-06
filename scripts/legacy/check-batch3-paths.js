const { Client } = require('pg');
const CONN = 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const slugs = ['crud-operations','design-rate-limiter','design-url-shortener','dfs','objects-and-interfaces','spring-profiles','topological-sort'];

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();
  for (const slug of slugs) {
    const r = await c.query(
      `SELECT t.slug, t.id as topic_id, lp.slug as path_slug, lp.title as path_title,
              (SELECT COUNT(*) FROM lessons WHERE topic_id = t.id) as lesson_count
       FROM topics t JOIN learning_paths lp ON lp.id = t.path_id WHERE t.slug = $1`,
      [slug]
    );
    if (r.rows.length) {
      console.log(JSON.stringify(r.rows[0]));
    } else {
      console.log(slug + ' -> NOT FOUND');
    }
  }
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });

