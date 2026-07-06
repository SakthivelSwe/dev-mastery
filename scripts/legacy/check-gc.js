const {Client} = require('pg');
const c = new Client({connectionString:'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'});
c.connect()
 .then(()=>c.query("SELECT l.section_type, length(l.content_mdx) as len FROM lessons l JOIN topics t ON l.topic_id=t.id JOIN learning_paths p ON t.path_id=p.id WHERE p.slug='full-stack' AND t.slug='garbage-collection-basics' ORDER BY l.section_type"))
 .then(r=>{console.log('GC sections:'); r.rows.forEach(x=>console.log(' ',x.section_type,x.len));return c.end();});





