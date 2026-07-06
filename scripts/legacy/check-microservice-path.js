const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres' });
(async () => {
  await c.connect();
  const paths = await c.query(`SELECT slug FROM learning_paths WHERE slug ILIKE '%micro%' OR slug ILIKE '%service%' ORDER BY slug`);
  console.log('Matching paths in DB:');
  paths.rows.forEach(r => console.log(' ', r.slug));
  const all = await c.query(`SELECT slug FROM learning_paths ORDER BY slug`);
  console.log('\nAll learning paths:');
  all.rows.forEach(r => console.log(' ', r.slug));
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });

