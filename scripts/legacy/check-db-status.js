const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});

c.connect().then(() => Promise.all([
  c.query('SELECT COUNT(*) FROM lessons'),
  c.query('SELECT COUNT(*) FROM topics'),
  c.query(`
    SELECT lp.slug, COUNT(DISTINCT t.id) as topic_count, COUNT(l.id) as lesson_count
    FROM learning_paths lp
    LEFT JOIN topics t ON t.path_id = lp.id
    LEFT JOIN lessons l ON l.topic_id = t.id
    GROUP BY lp.slug
    ORDER BY lp.slug
  `),
  c.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'lessons'
    ORDER BY ordinal_position
  `)
])).then(([lessons, topics, paths, visuals]) => {
  console.log('=== DATABASE STATUS ===');
  console.log('Total lessons:', lessons.rows[0].count);
  console.log('Total topics:', topics.rows[0].count);
  console.log('\n=== PATH BREAKDOWN ===');
  const expected = {
    'angular': 33, 'api-design': 21, 'css': 30, 'design-system': 29,
    'docker': 22, 'dsa': 54, 'full-stack': 93, 'git-github': 29,
    'html': 17, 'java-mastery': 68, 'javascript': 42, 'kubernetes': 27,
    'leetcode-patterns': 38, 'microservices': 28, 'mongodb': 16,
    'nextjs': 29, 'postgresql-dba': 22, 'react': 31, 'software-architecture': 19,
    'spring-boot': 34, 'sql': 27, 'system-design': 32, 'typescript': 21
  };
  paths.rows.forEach(r => {
    const exp = expected[r.slug] || '?';
    const expLessons = exp !== '?' ? exp * 9 : '?';
    const topicStatus = r.topic_count == exp ? '✅' : '❌';
    const lessonStatus = r.lesson_count == expLessons ? '✅' : `⚠️ (exp ${expLessons})`;
    console.log(`  ${topicStatus} ${r.slug}: ${r.topic_count}/${exp} topics, ${r.lesson_count} lessons ${lessonStatus}`);
  });

  // Check for missing paths in DB
  const dbSlugs = paths.rows.map(r => r.slug);
  const missingFromDB = Object.keys(expected).filter(s => !dbSlugs.includes(s));
  if (missingFromDB.length) {
    console.log('\n❌ PATHS MISSING FROM DB:', missingFromDB.join(', '));
  }

  console.log('\n=== LESSONS TABLE COLUMNS ===');
  visuals.rows.forEach(r => console.log(' ', r.column_name));

  c.end();
}).catch(e => { console.error('DB Error:', e.message); c.end(); });



