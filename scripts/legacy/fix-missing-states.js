const { Client } = require('pg');

const c = new Client({
  connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});

// State keys for topics with missing state or non-standard keys
const STATE_MAP = {
  'html/forms-html':                          'html-forms',
  'html/html-intro':                          'html-intro-dom',
  'html/links-and-images':                    'html-links-images',
  'html/semantic-elements':                   'html-semantic',
  'html/text-elements':                       'html-text-elements',
  'java-mastery/data-types-and-variables':    'java-data-types',
  'java-mastery/encapsulation':               'java-encapsulation',
  'java-mastery/exception-handling':          'java-exception-flow',
  'java-mastery/garbage-collection-mechanics':'java-gc-mechanics',
  'java-mastery/generics':                    'java-generics-erasure',
  'java-mastery/interfaces':                  'java-interfaces',
  'java-mastery/iterator-pattern':            'java-iterator-pattern',
  'java-mastery/lambda-expressions':          'java-lambda',
  'java-mastery/operators-and-expressions':   'java-operators',
  'java-mastery/optional':                    'java-optional',
  'java-mastery/streams-api':                 'java-streams-pipeline',
  'java-mastery/wrapper-classes':             'java-wrapper-classes',
};

async function run() {
  await c.connect();

  const result = await c.query(`
    SELECT l.id, l.content_mdx, lp.slug as path_slug, t.slug as topic_slug
    FROM lessons l
    JOIN topics t ON l.topic_id = t.id
    JOIN learning_paths lp ON t.path_id = lp.id
    WHERE l.section_type = 'visual'
    AND l.content_mdx LIKE '%"component"%'
    AND l.content_mdx NOT LIKE '%"state"%'
  `);

  console.log(`Found ${result.rows.length} lessons missing state key`);
  let fixed = 0;

  for (const row of result.rows) {
    const key = `${row.path_slug}/${row.topic_slug}`;
    const state = STATE_MAP[key];
    if (!state) {
      console.log(`  No state mapping for: ${key}`);
      continue;
    }

    // Check if "state" key is already present with a value
    const stateMatch = row.content_mdx && row.content_mdx.match(/"state"\s*:\s*"([^"]*)"/);
    if (stateMatch && stateMatch[1]) continue;

    const newContent = `## VISUALIZATION_CONFIG\n\n\`\`\`json\n{ "component": "${row.content_mdx.match(/"component"\s*:\s*"([^"]+)"/)?.[1] || 'FlowChart'}", "state": "${state}" }\n\`\`\``;

    await c.query('UPDATE lessons SET content_mdx = $1 WHERE id = $2', [newContent, row.id]);
    console.log(`  ✅ ${key} → state: ${state}`);
    fixed++;
  }

  console.log(`\nFixed: ${fixed}`);
  await c.end();
}

run().catch(e => { console.error(e.message); c.end(); });



