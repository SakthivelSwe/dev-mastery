const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});

c.connect().then(async () => {
  const r = await c.query(`
    SELECT t.slug, lp.slug as path 
    FROM topics t 
    JOIN learning_paths lp ON t.path_id = lp.id 
    WHERE t.has_visualizer = true 
    ORDER BY lp.slug, t.slug
  `);
  console.log('Topics with has_visualizer=true (' + r.rows.length + '):');
  r.rows.forEach(row => console.log(`  ${row.path}/${row.slug}`));
  await c.end();
}).catch(e => { console.error(e.message); c.end(); });

