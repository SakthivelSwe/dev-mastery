const {Client}=require('pg');
const c=new Client({connectionString:'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'});
c.connect().then(async()=>{
  const p = await c.query("SELECT id FROM learning_paths WHERE slug='java-mastery'");
  const pathId = p.rows[0].id;
  const t = await c.query('SELECT slug FROM topics WHERE path_id=$1 ORDER BY slug',[pathId]);
  console.log('Java-mastery topics in DB:',t.rows.length);
  t.rows.forEach(r=>console.log(' ',r.slug));
  c.end();
}).catch(e=>{console.error(e);process.exit(1);});

