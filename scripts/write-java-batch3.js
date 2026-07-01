// Script to write the 7 remaining java-mastery MDX files with full 9-section content
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'apps', 'web', 'content', 'java-mastery');

const files = {};

// Each entry is a topic slug → full MDX content. Loaded from sibling content files.
const contentDir = path.join(__dirname, 'java-mastery-batch3');
const slugs = ['dfs', 'topological-sort', 'crud-operations', 'design-rate-limiter',
               'design-url-shortener', 'objects-and-interfaces', 'spring-profiles'];

for (const slug of slugs) {
  const src = path.join(contentDir, `${slug}.mdx`);
  if (!fs.existsSync(src)) {
    console.error(`MISSING: ${src}`);
    process.exit(1);
  }
  const dst = path.join(CONTENT_DIR, `${slug}.mdx`);
  fs.copyFileSync(src, dst);
  console.log(`✅ Wrote ${slug}.mdx (${fs.statSync(dst).size} bytes)`);
}

console.log('\nAll 7 files written successfully.');

