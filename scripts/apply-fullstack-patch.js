/**
 * apply-fullstack-patch.js
 * Applies sections from full-stack-content-patch.js to MDX files
 */
const fs   = require('fs');
const path = require('path');
const patchData = require('./content/full-stack-content-patch.js');
const CONTENT_DIR = path.join(__dirname, '..', 'apps', 'web', 'content', 'full-stack');

const SECTION_KEY_MAP = {
  why: '## WHY', theory: '## THEORY', visual: '## VISUALIZATION_CONFIG',
  code: '## CODE', realworld: '## REAL_WORLD', interview: '## INTERVIEW',
  feynman: '## FEYNMAN CHECK', build: '## BUILD', spacedReview: '## SPACED REVIEW',
};

for (const [slug, data] of Object.entries(patchData)) {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) { console.log(`SKIP ${slug} — file not found`); continue; }

  let content = fs.readFileSync(filePath, 'utf8').trimEnd();
  let added = 0;

  for (const [key, heading] of Object.entries(SECTION_KEY_MAP)) {
    if (!data[key]) continue;
    if (content.includes(heading)) continue; // Already present
    content += '\n\n' + data[key].trim();
    added++;
  }

  if (added > 0) {
    fs.writeFileSync(filePath, content + '\n', 'utf8');
    console.log(`OK    ${slug} — added ${added} sections`);
  } else {
    console.log(`SKIP  ${slug} — already complete`);
  }
}

