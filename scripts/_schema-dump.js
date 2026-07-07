const { Client } = require('pg');
const CONN='postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
(async()=>{
  const c=new Client({connectionString:CONN});
  await c.connect();
  const r=await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='topics' ORDER BY ordinal_position`);
  console.log('topics columns:'); r.rows.forEach(x=>console.log(' ',x.column_name,x.data_type));
  const r2=await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='lessons' ORDER BY ordinal_position`);
  console.log('\nlessons columns:'); r2.rows.forEach(x=>console.log(' ',x.column_name,x.data_type));
  const r3=await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='learning_paths' ORDER BY ordinal_position`);
  console.log('\nlearning_paths columns:'); r3.rows.forEach(x=>console.log(' ',x.column_name,x.data_type));
  await c.end();
})().catch(e=>{console.error(e);process.exit(1)});

