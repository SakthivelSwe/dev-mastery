const { Client } = require('pg');
const CONN = 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';

const SECTION_ORDER = ['why','theory','visual','code','realworld','interview','feynman','build','spacedreview'];

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();

  const pathArg = process.argv[2] || 'dsa';

  // Get all topics for the path
  const topics = await c.query(
    'SELECT t.id, t.slug FROM topics t JOIN learning_paths lp ON lp.id = t.path_id WHERE lp.slug = $1 ORDER BY t.slug',
    [pathArg]
  );

  const missing = {};
  for (const topic of topics.rows) {
    const lessons = await c.query(
      'SELECT section_type FROM lessons WHERE topic_id = $1',
      [topic.id]
    );
    const have = new Set(lessons.rows.map(l => l.section_type));
    const missSections = SECTION_ORDER.filter(s => !have.has(s));
    if (missSections.length > 0) {
      missing[topic.slug] = missSections;
    }
  }

  console.log(`\nMissing sections for path: ${pathArg}`);
  const allMissing = {};
  for (const [slug, sections] of Object.entries(missing)) {
    sections.forEach(s => {
      allMissing[s] = (allMissing[s] || 0) + 1;
    });
    console.log(`  ${slug.padEnd(45)} missing: ${sections.join(', ')}`);
  }
  console.log('\nMissing section counts:', allMissing);
  console.log('Total topics with gaps:', Object.keys(missing).length, 'of', topics.rows.length);

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });

