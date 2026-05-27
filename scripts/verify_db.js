const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});
client.connect()
  .then(() => client.query('SELECT COUNT(*) FROM topics;'))
  .then(res => { console.log("Total topics:", res.rows[0].count); client.end(); })
  .catch(err => { console.error(err); client.end(); });
