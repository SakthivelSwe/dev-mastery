const {Client} = require('pg');
const conn = 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';

async function main() {
  const c = new Client({connectionString: conn});
  await c.connect();
  
  // Check if microservices path exists
  const existing = await c.query("SELECT id, slug, title FROM learning_paths WHERE slug='microservices'");
  console.log('Existing path:', existing.rows);
  
  if (existing.rows.length === 0) {
    console.log('Creating microservices learning path...');
    const result = await c.query(`
      INSERT INTO learning_paths (slug, title, description, icon, color, level, estimated_hours)
      VALUES ('microservices', 'Microservices Architecture', 
              'Master microservices design patterns, communication, resilience, and deployment with Spring Boot',
              'server', '#3B82F6', 'advanced', 40)
      RETURNING id, slug, title
    `);
    console.log('Created:', result.rows[0]);
  }
  
  // Check topic count
  const topics = await c.query("SELECT COUNT(*) FROM topics t JOIN learning_paths lp ON t.path_id=lp.id WHERE lp.slug='microservices'");
  console.log('Topics in DB:', topics.rows[0].count);
  
  // Check lesson count
  const lessons = await c.query("SELECT COUNT(*) FROM lessons l JOIN topics t ON l.topic_id=t.id JOIN learning_paths lp ON t.path_id=lp.id WHERE lp.slug='microservices'");
  console.log('Lessons in DB:', lessons.rows[0].count);
  
  await c.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });

