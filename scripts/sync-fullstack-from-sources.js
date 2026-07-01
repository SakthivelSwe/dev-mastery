/**
 * sync-fullstack-from-sources.js
 * Copies 9-section content from source paths into full-stack MDX files.
 * Run: node scripts/sync-fullstack-from-sources.js
 */
const fs   = require('fs');
const path = require('path');

const CONTENT_ROOT = path.join(__dirname, '..', 'apps', 'web', 'content');

// Map: full-stack topic slug → source path slug
// When a topic exists identically in another path, copy from there
const TOPIC_SOURCE_MAP = {
  // DSA
  'bfs':                          'dsa',
  'dfs':                          'dsa',
  'shortest-path-dijkstra':       'dsa',
  'topological-sort':             'dsa',
  'garbage-collection-mechanics': 'dsa',
  'java-memory-model':            'dsa',
  // JavaScript
  'closures':                     'javascript',
  'event-loop':                   'javascript',
  'prototype-chain':              'javascript',
  'type-coercion':                'javascript',
  'data-types':                   'javascript',
  'variables':                    'javascript',
  'js-intro':                     'javascript',
  // TypeScript
  'basic-types':                  'typescript',
  'functions-ts':                 'typescript',
  'objects-and-interfaces':       'typescript',
  'ts-intro':                     'typescript',
  'union-and-intersection':       'typescript',
  // CSS
  'box-model':                    'css',
  'selectors':                    'css',
  'css-intro':                    'css',
  // HTML
  'html-intro':                   'html',
  'text-elements':                'html',
  'list-elements':                'html',
  // React
  'react-intro':                  'react',
  'components':                   'react',
  'props':                        'react',
  'jsx':                          'react',
  // Angular
  'components-angular':           'angular',
  'services-and-di':              'angular',
  'templates':                    'angular',
  // Spring Boot
  'spring-beans':                 'spring-boot',
  'dependency-injection':         'spring-boot',
  // SQL
  'sql-intro':                    'sql',
  'select-deep':                  'sql',
  'ddl-basics':                   'sql',
  'dml-basics':                   'sql',
  'crud-operations':              'sql',
  // MongoDB
  'mongodb-intro':                'mongodb',
  // API Design
  'rest-principles':              'api-design',
  // Software Architecture
  'solid-principles':             'software-architecture',
  // Design System
  'design-tokens':                'design-system',
  'spacing-system':               'design-system',
  'color-system':                 'design-system',
  'typography-system':            'design-system',
  // System Design
  'design-rate-limiter':          'system-design',
  'design-url-shortener':         'system-design',
  // Java Mastery
  'concurrency-basics':           'java-mastery',
  'arraylist-vs-linkedlist':      'java-mastery',
  'collections-overview':         'java-mastery',
};

// Slug aliases — sometimes source slug differs from full-stack slug
const SLUG_ALIAS = {
  'css-intro':            'css-intro',
  'components-angular':   'components',   // angular/components.mdx
  'js-intro':             'javascript-intro', // try javascript-intro first
  'design-rate-limiter':  'design-rate-limiter',
  'design-url-shortener': 'url-shortener',
};

const SECTIONS = ['## WHY','## THEORY','## VISUALIZATION_CONFIG','## CODE','## REAL_WORLD','## INTERVIEW','## FEYNMAN CHECK','## BUILD','## SPACED REVIEW'];

function hasSection(content, section) {
  return new RegExp(`^${section.replace('##', '##')}`, 'mi').test(content);
}

function getMissingSections(content) {
  return SECTIONS.filter(s => !content.includes(s));
}

function extractSection(content, heading) {
  const idx = content.indexOf(heading);
  if (idx === -1) return null;
  // Find next ## heading after this one
  const rest = content.substring(idx);
  const nextMatch = rest.match(/\n## (?!.*\n## )/);
  const nextIdx = rest.slice(1).search(/\n## /);
  if (nextIdx === -1) return rest.trim();
  return rest.substring(0, nextIdx + 1).trim();
}

function findSourceFile(topic, sourcePath) {
  const alias = SLUG_ALIAS[topic];
  const slugsToTry = alias ? [alias, topic] : [topic];

  for (const slug of slugsToTry) {
    const filePath = path.join(CONTENT_ROOT, sourcePath, `${slug}.mdx`);
    if (fs.existsSync(filePath)) return filePath;
  }

  // If still not found, list directory and fuzzy match
  const dir = path.join(CONTENT_ROOT, sourcePath);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
  const match = files.find(f => f.replace('.mdx','') === topic || f.includes(topic.split('-')[0]));
  if (match) return path.join(dir, match);
  return null;
}

let synced = 0, skipped = 0, notFound = 0;

for (const [topic, sourcePath] of Object.entries(TOPIC_SOURCE_MAP)) {
  const destFile = path.join(CONTENT_ROOT, 'full-stack', `${topic}.mdx`);
  if (!fs.existsSync(destFile)) {
    console.log(`  SKIP  ${topic} — dest MDX not found`);
    skipped++;
    continue;
  }

  const destContent = fs.readFileSync(destFile, 'utf8');
  const missing = getMissingSections(destContent);
  if (missing.length === 0) {
    console.log(`  OK    ${topic} — already complete`);
    continue;
  }

  const sourceFile = findSourceFile(topic, sourcePath);
  if (!sourceFile) {
    console.log(`  MISS  ${topic} — source not found in ${sourcePath}/`);
    notFound++;
    continue;
  }

  const sourceContent = fs.readFileSync(sourceFile, 'utf8');
  let updatedContent = destContent.trimEnd();

  // Copy missing sections from source
  let sectionsCopied = 0;
  for (const section of missing) {
    const extracted = extractSection(sourceContent, section);
    if (extracted) {
      // For VISUALIZATION_CONFIG, update the state key to include 'fs-' prefix
      let sectionContent = extracted;
      if (section === '## VISUALIZATION_CONFIG') {
        sectionContent = sectionContent.replace(/"state":\s*"([^"]+)"/, `"state": "fs-$1"`);
      }
      updatedContent += '\n\n' + sectionContent;
      sectionsCopied++;
    }
  }

  if (sectionsCopied > 0) {
    fs.writeFileSync(destFile, updatedContent + '\n', 'utf8');
    console.log(`  SYNC  ${topic} ← ${sourcePath} (added ${sectionsCopied}/${missing.length} sections)`);
    synced++;
  } else {
    console.log(`  WARN  ${topic} — source missing sections: ${missing.join(', ')}`);
  }
}

console.log(`\n=== COMPLETE ===`);
console.log(`Synced: ${synced}, Skipped: ${skipped}, Not found: ${notFound}`);

// Show remaining incomplete topics
console.log('\n=== STILL INCOMPLETE ===');
const fsDir = path.join(CONTENT_ROOT, 'full-stack');
const files = fs.readdirSync(fsDir).filter(f => f.endsWith('.mdx'));
files.forEach(f => {
  const c = fs.readFileSync(path.join(fsDir, f), 'utf8');
  const missing = getMissingSections(c);
  if (missing.length > 0) console.log(`  ${f.replace('.mdx','')} — missing: ${missing.join(', ')}`);
});

