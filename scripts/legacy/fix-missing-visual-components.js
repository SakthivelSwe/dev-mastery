const { Client } = require('pg');

const c = new Client({
  connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});

// Best component for java-mastery topics without a valid VISUALIZATION_CONFIG
const JAVA_TOPIC_COMPONENTS = {
  'annotations':                  { component: 'FlowChart',         state: 'java-annotations-processing' },
  'arraylist-vs-linkedlist':      { component: 'FlowChart',         state: 'java-arraylist-vs-linkedlist' },
  'arrays':                       { component: 'TreeVisualization', state: 'java-arrays' },
  'collections-overview':         { component: 'ConceptMap',        state: 'java-collections-overview' },
  'comparator-and-comparable':    { component: 'UmlClassDiagram',   state: 'java-comparator-comparable' },
  'concurrency-basics':           { component: 'FlowChart',         state: 'java-thread-states' },
  'concurrency-utilities':        { component: 'FlowChart',         state: 'java-concurrency-utils' },
  'concurrent-collections':       { component: 'FlowChart',         state: 'java-concurrent-collections' },
  'control-flow':                 { component: 'FlowChart',         state: 'java-control-flow' },
  'design-patterns-in-java':      { component: 'UmlClassDiagram',   state: 'java-design-patterns' },
  'enums':                        { component: 'UmlClassDiagram',   state: 'java-enums' },
  'executorservice':              { component: 'FlowChart',         state: 'java-executorservice' },
  'functional-interfaces':        { component: 'FlowChart',         state: 'java-functional-interfaces' },
  'garbage-collection':           { component: 'FlowChart',         state: 'java-gc' },
  'hashmap-internals':            { component: 'FlowChart',         state: 'java-hashmap-internals' },
  'inner-classes':                { component: 'UmlClassDiagram',   state: 'java-inner-classes' },
  'io-and-nio':                   { component: 'FlowChart',         state: 'java-io-nio' },
  'java-concurrency-deep-dive':   { component: 'FlowChart',         state: 'java-concurrency-deep' },
  'java-intro':                   { component: 'FlowChart',         state: 'java-intro-jvm' },
  'java-memory-model':            { component: 'MemoryDiagram',     state: 'java-memory-model' },
  'java-modules':                 { component: 'ConceptMap',        state: 'java-modules' },
  'jvm-architecture':             { component: 'FlowChart',         state: 'java-jvm-arch' },
  'jvm-classloaders':             { component: 'FlowChart',         state: 'java-classloaders' },
  'linkedhashmap':                { component: 'FlowChart',         state: 'java-linkedhashmap' },
  'methods':                      { component: 'FlowChart',         state: 'java-methods' },
  'performance-tuning':           { component: 'FlowChart',         state: 'java-performance' },
  'records-and-sealed-classes':   { component: 'UmlClassDiagram',   state: 'java-records-sealed' },
  'reflection':                   { component: 'FlowChart',         state: 'java-reflection' },
  'serialization':                { component: 'FlowChart',         state: 'java-serialization' },
  'strings':                      { component: 'MemoryDiagram',     state: 'java-string-pool' },
  'virtual-threads':              { component: 'FlowChart',         state: 'java-virtual-threads' },
};

const DESIGN_SYSTEM_TOPIC_COMPONENTS = {
  'button-component': { component: 'ConceptMap', state: 'ds-button-component' },
  'data-display':     { component: 'ConceptMap', state: 'ds-data-display' },
};

function buildVisualizationConfig(component, state) {
  return `## VISUALIZATION_CONFIG\n\n\`\`\`json\n{ "component": "${component}", "state": "${state}" }\n\`\`\``;
}

async function run() {
  await c.connect();

  // Get all visual lessons missing component field
  const result = await c.query(`
    SELECT l.id, l.content_mdx, lp.slug as path_slug, t.slug as topic_slug
    FROM lessons l
    JOIN topics t ON l.topic_id = t.id
    JOIN learning_paths lp ON t.path_id = lp.id
    WHERE l.section_type = 'visual'
    AND (l.content_mdx NOT LIKE '%"component"%' OR l.content_mdx IS NULL)
    ORDER BY lp.slug, t.slug
  `);

  console.log(`Found ${result.rows.length} lessons with missing component fields`);

  let fixed = 0;
  let skipped = 0;

  for (const row of result.rows) {
    let mapping;
    if (row.path_slug === 'java-mastery') {
      mapping = JAVA_TOPIC_COMPONENTS[row.topic_slug];
    } else if (row.path_slug === 'design-system') {
      mapping = DESIGN_SYSTEM_TOPIC_COMPONENTS[row.topic_slug];
    }

    if (!mapping) {
      console.log(`  No mapping for: ${row.path_slug}/${row.topic_slug}`);
      skipped++;
      continue;
    }

    const newContent = buildVisualizationConfig(mapping.component, mapping.state);
    await c.query('UPDATE lessons SET content_mdx = $1 WHERE id = $2', [newContent, row.id]);
    console.log(`  ✅ Fixed: ${row.path_slug}/${row.topic_slug} → ${mapping.component}`);
    fixed++;
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Fixed: ${fixed}, Skipped: ${skipped}`);

  await c.end();
}

run().catch(e => { console.error(e.message); c.end(); });

