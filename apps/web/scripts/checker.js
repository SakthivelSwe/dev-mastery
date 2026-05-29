const fs = require('fs');
const path = require('path');

const v11Path = 'c:/Projects/dev-mastery/services/content-service/src/main/resources/db/migration/V11__seed_topics_all_paths.sql';
const contentDir = 'c:/Projects/dev-mastery/apps/web/content';

const sqlContent = fs.readFileSync(v11Path, 'utf8');

const pathRegex = /SELECT id INTO path_id FROM learning_paths WHERE slug = '([^']+)';([\s\S]*?)(?=SELECT id INTO path_id|$)/g;

let match;
const expected = {};

while ((match = pathRegex.exec(sqlContent)) !== null) {
  const pathSlug = match[1];
  const block = match[2];
  
  const topicRegex = /\(\s*gen_random_uuid\(\),\s*path_id,\s*'([^']+)'/g;
  let topicMatch;
  expected[pathSlug] = [];
  while ((topicMatch = topicRegex.exec(block)) !== null) {
    expected[pathSlug].push(topicMatch[1]);
  }
}

let totalMissing = 0;
let totalPaths = 0;
let completedPaths = 0;

for (const [pathSlug, topics] of Object.entries(expected)) {
  totalPaths++;
  const dir = path.join(contentDir, pathSlug);
  if (!fs.existsSync(dir)) {
    console.log(`Path ${pathSlug}: Missing directory entirely. Expected ${topics.length} topics.`);
    totalMissing += topics.length;
    continue;
  }
  
  const existingFiles = fs.readdirSync(dir).filter(f => f.endsWith('.mdx')).map(f => f.replace('.mdx', ''));
  
  const missing = topics.filter(t => !existingFiles.includes(t));
  if (missing.length > 0) {
    console.log(`Path ${pathSlug}: Missing ${missing.length} out of ${topics.length} topics.`);
    console.log(`  -> ${missing.join(', ')}`);
    totalMissing += missing.length;
  } else if (topics.length > 0) {
    console.log(`Path ${pathSlug}: COMPLETE (${topics.length}/${topics.length})`);
    completedPaths++;
  }
}
console.log(`\nOVERALL: ${completedPaths}/${totalPaths} paths complete. ${totalMissing} total missing topics.`);
