const { Client } = require('pg');

const c = new Client({
  connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});

async function run() {
  await c.connect();

  // These are the 14 remaining - look at their raw content
  const result = await c.query(`
    SELECT l.id, l.content_mdx, lp.slug as path_slug, t.slug as topic_slug
    FROM lessons l
    JOIN topics t ON l.topic_id = t.id
    JOIN learning_paths lp ON t.path_id = lp.id
    WHERE l.section_type = 'visual'
    AND lp.slug IN ('html', 'java-mastery')
    AND t.slug IN ('forms-html','html-intro','semantic-elements','data-types-and-variables',
                   'encapsulation','exception-handling','garbage-collection-mechanics',
                   'generics','interfaces','iterator-pattern','lambda-expressions',
                   'operators-and-expressions','optional','streams-api')
  `);

  for (const row of result.rows) {
    console.log(`\n=== ${row.path_slug}/${row.topic_slug} ===`);
    console.log(row.content_mdx ? row.content_mdx.substring(0, 200) : 'NULL');
  }

  await c.end();
}
run().catch(e => { console.error(e.message); c.end(); });

