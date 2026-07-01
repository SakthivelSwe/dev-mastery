const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const c = new Client({
  connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});

const CONTENT_DIR = path.join(__dirname, '..', 'apps', 'web', 'content');

// Valid components per SKILL.md
const VALID_COMPONENTS = ['FlowChart','SequenceDiagram','UmlClassDiagram','StateMachine',
  'NetworkDiagram','DatabaseSchema','TreeVisualization','ConceptMap','GitGraph','MemoryDiagram','CodeRunner'];

async function run() {
  await c.connect();

  // Get all visual lessons from DB
  const dbVisuals = await c.query(`
    SELECT lp.slug as path_slug, t.slug as topic_slug, l.content_mdx
    FROM learning_paths lp
    JOIN topics t ON t.path_id = lp.id
    JOIN lessons l ON l.topic_id = t.id
    WHERE l.section_type = 'visual'
    ORDER BY lp.slug, t.slug
  `);

  console.log('=== VISUALIZATION AUDIT ===');
  console.log(`Total visual lessons in DB: ${dbVisuals.rows.length}\n`);

  const issues = [];
  const ok = [];

  for (const row of dbVisuals.rows) {
    const content = row.content_mdx || '';
    // Extract component from JSON block
    const match = content.match(/"component"\s*:\s*"([^"]+)"/);
    const stateMatch = content.match(/"state"\s*:\s*"([^"]+)"/);
    const component = match ? match[1] : null;
    const state = stateMatch ? stateMatch[1] : null;

    if (!component) {
      issues.push({ path: row.path_slug, topic: row.topic_slug, issue: '❌ Missing component field', component: null, state });
    } else if (!VALID_COMPONENTS.includes(component)) {
      issues.push({ path: row.path_slug, topic: row.topic_slug, issue: `❌ Invalid component: "${component}"`, component, state });
    } else {
      // Check state format: should be "path-topic"
      if (!state) {
        issues.push({ path: row.path_slug, topic: row.topic_slug, issue: `⚠️ Missing state key`, component, state });
      } else {
        ok.push({ path: row.path_slug, topic: row.topic_slug, component, state });
      }
    }
  }

  // Also check MDX files for missing VISUALIZATION_CONFIG
  const paths = fs.readdirSync(CONTENT_DIR).filter(p =>
    fs.statSync(path.join(CONTENT_DIR, p)).isDirectory()
  );

  const missingVisual = [];
  for (const pathSlug of paths) {
    const pathDir = path.join(CONTENT_DIR, pathSlug);
    const mdxFiles = fs.readdirSync(pathDir).filter(f => f.endsWith('.mdx'));
    for (const mdxFile of mdxFiles) {
      const content = fs.readFileSync(path.join(pathDir, mdxFile), 'utf8');
      if (!content.includes('## VISUALIZATION_CONFIG')) {
        const topicSlug = mdxFile.replace('.mdx', '');
        missingVisual.push({ path: pathSlug, topic: topicSlug });
      }
    }
  }

  console.log('=== VISUALIZATION ISSUES IN DB ===');
  if (issues.length === 0) {
    console.log('✅ All visual lessons have valid components\n');
  } else {
    issues.forEach(i => console.log(`  ${i.issue} | ${i.path}/${i.topic} | component: ${i.component} | state: ${i.state}`));
    console.log(`\nTotal issues: ${issues.length}\n`);
  }

  console.log('=== TOPICS MISSING VISUALIZATION_CONFIG IN MDX FILES ===');
  if (missingVisual.length === 0) {
    console.log('✅ All MDX files have VISUALIZATION_CONFIG\n');
  } else {
    missingVisual.slice(0, 50).forEach(i => console.log(`  ❌ ${i.path}/${i.topic}`));
    if (missingVisual.length > 50) console.log(`  ... and ${missingVisual.length - 50} more`);
    console.log(`\nTotal missing: ${missingVisual.length}\n`);
  }

  console.log('=== VISUALIZATION COMPONENT DISTRIBUTION (from DB) ===');
  const compCount = {};
  ok.forEach(r => { compCount[r.component] = (compCount[r.component] || 0) + 1; });
  issues.filter(i=>i.component).forEach(r => { compCount[r.component] = (compCount[r.component] || 0) + 1; });
  Object.entries(compCount).sort((a,b) => b[1]-a[1]).forEach(([comp, count]) => {
    console.log(`  ${comp}: ${count}`);
  });

  console.log(`\n=== SUMMARY ===`);
  console.log(`DB visual lessons: ${dbVisuals.rows.length}`);
  console.log(`Valid: ${ok.length}`);
  console.log(`Issues: ${issues.length}`);
  console.log(`MDX files missing VISUALIZATION_CONFIG: ${missingVisual.length}`);

  await c.end();
}

run().catch(e => { console.error(e.message); c.end(); });

