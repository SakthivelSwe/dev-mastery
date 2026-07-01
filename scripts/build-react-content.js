/**
 * Rebuilds react-content.js from individual batch files.
 * Run: node scripts/build-react-content.js
 */
const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'content');

// Load batch files that are valid
const batches = [
  'react-batch5.js',
  'react-batch6.js',
];

let merged = {};
for (const batchFile of batches) {
  try {
    const batchPath = path.join(contentDir, batchFile);
    const batch = require(batchPath);
    merged = { ...merged, ...batch };
    console.log(`Loaded ${batchFile}: ${Object.keys(batch).length} topics`);
  } catch (err) {
    console.error(`Failed to load ${batchFile}:`, err.message);
  }
}

console.log('\nTotal topics in new merged file:', Object.keys(merged).length);

// Write as a proper module
let out = 'module.exports = {\n';
for (const [k, v] of Object.entries(merged)) {
  out += "  '" + k + "': {\n";
  for (const [sk, sv] of Object.entries(v)) {
    // JSON.stringify handles escaping; wrap in template to preserve backticks
    const encoded = JSON.stringify(sv);
    out += '    ' + sk + ': ' + encoded + ',\n';
  }
  out += '  },\n';
}
out += '};\n';

const outputPath = path.join(contentDir, 'react-batch56-merged.js');
fs.writeFileSync(outputPath, out, 'utf8');
console.log('Written to:', outputPath);
console.log('File size:', Math.round(fs.statSync(outputPath).size / 1024) + 'KB');

