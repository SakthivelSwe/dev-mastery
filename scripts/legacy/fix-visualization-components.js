const { Client } = require('pg');

const c = new Client({
  connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});

// Mapping from invalid component names → valid SKILL.md components
// Based on the 11 valid components: FlowChart, SequenceDiagram, UmlClassDiagram,
// StateMachine, NetworkDiagram, DatabaseSchema, TreeVisualization, ConceptMap,
// GitGraph, MemoryDiagram, CodeRunner

const COMPONENT_MAP = {
  // Most common - generic architecture/flow topics → ConceptMap or FlowChart
  'ArchitectureVisualizer':   null, // context-dependent, handled per path below
  'ArchitectureDiagram':      'ConceptMap',

  // Code execution / demos
  'CodeVisualizer':           'CodeRunner',
  'CodeStepsVisualizer':      'CodeRunner',
  'TerminalVisualizer':       'CodeRunner',

  // Algorithm / data structure
  'AlgorithmVisualizer':      'FlowChart',
  'DataStructureVisualizer':  'TreeVisualization',
  'DPVisualizer':             'FlowChart',
  'TreeVisualizer':           'TreeVisualization',
  'GraphVisualizer':          'NetworkDiagram',
  'QueueVisualizer':          'TreeVisualization',
  'BitwiseVisualizer':        'FlowChart',

  // DB / Storage
  'DBVisualizer':             'DatabaseSchema',
  'SQLVisualizer':            'DatabaseSchema',

  // UI / Component
  'DOMVisualizer':            'TreeVisualization',
  'ComponentTree':            'TreeVisualization',
  'ComponentVisualizer':      'ConceptMap',
  'UIComponentVisualizer':    'ConceptMap',
  'DesignSystemVisualizer':   'ConceptMap',
  'CSSVisualizer':            'CodeRunner',
  'RenderVisualizer':         'FlowChart',
  'CompilerVisualizer':       'FlowChart',

  // State / lifecycle
  'StateVisualizer':          'StateMachine',

  // Security
  'SecurityVisualizer':       'SequenceDiagram',

  // Git
  'GitVisualizer':            'GitGraph',

  // Java-specific
  'BytecodeVisualizer':       'FlowChart',
  'VTableVisualizer':         'UmlClassDiagram',
  'MemoryLayoutVisualizer':   'MemoryDiagram',
  'DynamicDispatchVisualizer':'UmlClassDiagram',
  'WrapperClassVisualizer':   'UmlClassDiagram',
  'MemoryVisualizer':         'MemoryDiagram',

  // TypeScript
  'TypeVisualizer':           'FlowChart',

  // Config / file structure
  'FileVisualizer':           'ConceptMap',
  'ConfigVisualizer':         'ConceptMap',
};

// For ArchitectureVisualizer - map by path slug to best component
const ARCH_VIZ_BY_PATH = {
  'angular':               'FlowChart',
  'api-design':            'SequenceDiagram',
  'css':                   'FlowChart',
  'design-system':         'ConceptMap',
  'docker':                'NetworkDiagram',
  'dsa':                   'FlowChart',
  'full-stack':            'SequenceDiagram',
  'git-github':            'GitGraph',
  'html':                  'FlowChart',
  'java-mastery':          'FlowChart',
  'javascript':            'FlowChart',
  'kubernetes':            'NetworkDiagram',
  'leetcode-patterns':     'FlowChart',
  'microservices':         'NetworkDiagram',
  'mongodb':               'DatabaseSchema',
  'nextjs':                'FlowChart',
  'postgresql-dba':        'FlowChart',
  'react':                 'FlowChart',
  'software-architecture': 'ConceptMap',
  'spring-boot':           'FlowChart',
  'sql':                   'DatabaseSchema',
  'system-design':         'ConceptMap',
  'typescript':            'FlowChart',
};

async function run() {
  await c.connect();

  // Get all visual lessons with invalid components
  const result = await c.query(`
    SELECT l.id, l.content_mdx, lp.slug as path_slug, t.slug as topic_slug
    FROM lessons l
    JOIN topics t ON l.topic_id = t.id
    JOIN learning_paths lp ON t.path_id = lp.id
    WHERE l.section_type = 'visual'
    AND l.content_mdx IS NOT NULL
  `);

  const VALID = new Set(['FlowChart','SequenceDiagram','UmlClassDiagram','StateMachine',
    'NetworkDiagram','DatabaseSchema','TreeVisualization','ConceptMap','GitGraph','MemoryDiagram','CodeRunner']);

  let fixed = 0;
  let skipped = 0;
  let noFix = 0;

  for (const row of result.rows) {
    const content = row.content_mdx;
    const match = content.match(/"component"\s*:\s*"([^"]+)"/);
    if (!match) { noFix++; continue; }

    const component = match[1];
    if (VALID.has(component)) { skipped++; continue; }

    // Determine replacement
    let newComponent;
    if (component === 'ArchitectureVisualizer') {
      newComponent = ARCH_VIZ_BY_PATH[row.path_slug] || 'ConceptMap';
    } else {
      newComponent = COMPONENT_MAP[component];
    }

    if (!newComponent) { noFix++; console.log(`No mapping for: ${component} at ${row.path_slug}/${row.topic_slug}`); continue; }

    // Replace component in content
    const newContent = content.replace(
      `"component": "${component}"`,
      `"component": "${newComponent}"`
    );

    await c.query('UPDATE lessons SET content_mdx = $1 WHERE id = $2', [newContent, row.id]);
    fixed++;
    if (fixed % 50 === 0) console.log(`Progress: ${fixed} fixed...`);
  }

  console.log(`\n=== FIX COMPLETE ===`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Already valid: ${skipped}`);
  console.log(`No mapping found: ${noFix}`);

  await c.end();
}

run().catch(e => { console.error(e.message); c.end(); });

