const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});

c.connect().then(async () => {
  const r = await c.query(`
    SELECT t.slug FROM topics t 
    JOIN learning_paths lp ON t.path_id = lp.id 
    WHERE lp.slug = 'postgresql-dba' 
    ORDER BY t.slug
  `);
  const mdxFiles = require('fs').readdirSync('apps/web/content/postgresql-dba')
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace('.mdx', ''));

  const dbSlugs = r.rows.map(r => r.slug);
  console.log('DB topics (' + dbSlugs.length + '):', dbSlugs.join(', '));
  console.log('\nMDX files (' + mdxFiles.length + '):', mdxFiles.sort().join(', '));

  const extra = dbSlugs.filter(s => !mdxFiles.includes(s));
  const missing = mdxFiles.filter(s => !dbSlugs.includes(s));

  console.log('\nExtra in DB (not in MDX):', extra.join(', ') || 'none');
  console.log('Missing from DB (in MDX but not DB):', missing.join(', ') || 'none');

  await c.end();
}).catch(e => { console.error(e.message); c.end(); });

