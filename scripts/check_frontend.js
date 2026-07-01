const { Client } = require('pg');
const CONN = 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const PATHS = ['javascript','typescript','react','angular','html','css'];

(async () => {
  const cl = new Client({ connectionString: CONN });
  await cl.connect();
  for (const path of PATHS) {
    const topics = await cl.query(
      `SELECT t.slug, COUNT(l.id) as n, array_agg(l.section_type ORDER BY l.order_index) as secs
       FROM topics t
       JOIN learning_paths lp ON lp.id = t.path_id
       LEFT JOIN lessons l ON l.topic_id = t.id
       WHERE lp.slug = $1
       GROUP BY t.slug
       ORDER BY t.slug`,
      [path]
    );
    console.log(`\n=== ${path.toUpperCase()} (${topics.rows.length} topics) ===`);
    topics.rows.forEach(r => {
      const missing = ['why','theory','visual','code','realworld','interview','feynman','build','spacedreview']
        .filter(s => !r.secs || !r.secs.includes(s));
      console.log(`  ${r.slug.padEnd(40)} sections=${r.n} missing=${missing.join(',') || 'none'}`);
    });
  }
  await cl.end();
})().catch(e => console.error(e));

