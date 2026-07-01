const {Client} = require('pg');
const c = new Client({connectionString:'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'});
c.connect().then(async () => {
  const r1 = await c.query("SELECT COUNT(*) FROM lessons l JOIN topics t ON l.topic_id=t.id JOIN learning_paths lp ON t.path_id=lp.id WHERE lp.slug='microservices'");
  console.log('Microservices lessons:', r1.rows[0].count);
  const r2 = await c.query("SELECT COUNT(*) FROM topics t JOIN learning_paths lp ON t.path_id=lp.id WHERE lp.slug='microservices'");
  console.log('Microservices topics:', r2.rows[0].count);
  const r3 = await c.query("SELECT COUNT(*) FROM lessons");
  console.log('Total lessons:', r3.rows[0].count);
  c.end();
}).catch(e => { console.error(e.message); c.end(); });

