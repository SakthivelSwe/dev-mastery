const { Client } = require('pg');
const CONN = 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();

  // Topics with fewer than 9 lessons
  const r = await c.query(
    'SELECT lp.slug as path_slug, t.slug, COUNT(l.id) as lesson_count ' +
    'FROM topics t ' +
    'JOIN learning_paths lp ON lp.id = t.path_id ' +
    'LEFT JOIN lessons l ON l.topic_id = t.id ' +
    'GROUP BY lp.slug, t.slug ' +
    'HAVING COUNT(l.id) < 9 ' +
    'ORDER BY lp.slug, t.slug ' +
    'LIMIT 100'
  );
  console.log('Topics with < 9 lessons:', r.rows.length);
  r.rows.forEach(row => console.log('  ' + row.path_slug.padEnd(25) + row.slug.padEnd(40) + row.lesson_count));

  // Summary by path
  const s = await c.query(
    'SELECT lp.slug as path_slug, COUNT(DISTINCT t.id) as topics, COUNT(l.id) as lessons ' +
    'FROM learning_paths lp ' +
    'LEFT JOIN topics t ON t.path_id = lp.id ' +
    'LEFT JOIN lessons l ON l.topic_id = t.id ' +
    'GROUP BY lp.slug ' +
    'ORDER BY lp.slug'
  );
  console.log('\nPath summary:');
  s.rows.forEach(row => console.log('  ' + row.path_slug.padEnd(25) + 'topics=' + String(row.topics).padEnd(8) + 'lessons=' + row.lessons));

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });

