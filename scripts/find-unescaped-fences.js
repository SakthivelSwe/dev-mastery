// Scans design-system-content.js, finds unescaped ``` inside template literals
// and reports their line numbers so we can fix them.
const fs = require('fs');
const path = require('path');
const lines = fs.readFileSync(path.join(__dirname, 'content', 'design-system-content.js'), 'utf-8').split('\n');
let inTemplate = false;
let templateStartLine = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Detect lines that open a template literal: ends with `<key>: \`` ... or starts/contains a lone backtick
  // Simpler: count unescaped backticks per line. \` doesn't toggle. lone ` toggles.
  // Strip escaped backticks first.
  const stripped = line.replace(/\\`/g, '');
  // Count `` (already-escaped-fence) and ` (lone)
  // Find any ``` that is NOT preceded by \
  // Actually, in JS source `\`\`\`` represents ``` inside a template literal.
  // So a literal ``` in the source (NOT escaped) means: template ends, then double backtick = empty template, then template starts.
  // Let's just flag any line with `\`\`\`` removed leaving raw ```
  const after = line.replace(/\\`\\`\\`/g, '___FENCE___');
  if (/```/.test(after)) {
    console.log(`Line ${i+1}: unescaped fence: ${line.trim().slice(0, 80)}`);
  }
}

