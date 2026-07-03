#!/usr/bin/env node
/**
 * Universal visualizer config fixer.
 * Usage: node scripts/_fix-visualizer.js path/to/config.js
 */
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('Usage: node _fix-visualizer.js <file>'); process.exit(1); }

let src = fs.readFileSync(file, 'utf8');
const lines = src.split('\n');

// 1. Fix label( -> label:
for (let i = 0; i < lines.length; i++) {
  // {label('text', color:'#xxx', highlight:true)]
  lines[i] = lines[i].replace(/\{label\('([^']+)',\s*color:'([^']+)',\s*highlight:true\)\]/g, "{label:'$1', color:'$2', highlight:true},");
  lines[i] = lines[i].replace(/\{label\('([^']+)',\s*color:'([^']+)'\)\]/g, "{label:'$1', color:'$2'},");
  lines[i] = lines[i].replace(/\{label\('([^']+)',\s*done:true\)\]/g, "{label:'$1', done:true},");
  lines[i] = lines[i].replace(/\{label\('([^']+)',\s*active:true\)\]/g, "{label:'$1', active:true},");
  lines[i] = lines[i].replace(/\{label\('([^']+)'\)\}/g, "{label:'$1'},");
  lines[i] = lines[i].replace(/\{label\('([^']+)'\)\]/g, "{label:'$1'},");
  // any remaining {label(' -> {label:'
  lines[i] = lines[i].replace(/\{label\('([^')]+?)'/g, "{label:'$1'");
  // ')], at end -> '},
  lines[i] = lines[i].replace(/'([^']*?)'\)\]/g, "'$1'},");
  // )] after color/value -> },
  lines[i] = lines[i].replace(/, color:'([^']+)'\)\]/g, ", color:'$1'},");
  // double commas
  lines[i] = lines[i].replace(/,\s*,/g, ',');
}

// 2. Fix diagram:{ kind:'x', title:'y' }, items:[ -> diagram:{ kind:'x', title:'y', items:[
src = lines.join('\n');
src = src.replace(/diagram:\{ kind:'([^']+)', title:'([^']+)' \}, items:\[/g, "diagram:{ kind:'$1', title:'$2', items:[");
src = src.replace(/diagram:\{ kind:'([^']+)' \}, items:\[/g, "diagram:{ kind:'$1', items:[");

// 3. Fix title(
src = src.replace(/title\('([^']+)'\)\]/g, "title:'$1' }");
src = src.replace(/title\('([^']+)'\)/g, "title:'$1'");

// 4. Fix missing }, on label lines
const fixed = src.split('\n');
for (let i = 0; i < fixed.length; i++) {
  const line = fixed[i];
  if (/^\s+\{label:/.test(line) && !line.trimEnd().endsWith('},') && !line.trimEnd().endsWith('}')) {
    fixed[i] = line.trimEnd() + '},';
  }
}
src = fixed.join('\n');
// double commas final pass
src = src.replace(/,\s*,/g, ',');

fs.writeFileSync(file, src, 'utf8');
console.log(`Fixed: ${file}`);

// Syntax check
const { execSync } = require('child_process');
try {
  execSync(`node --check "${file}"`, { stdio: 'pipe' });
  console.log('SYNTAX OK');
} catch (e) {
  const msg = e.stderr.toString().split('\n').slice(0,6).join('\n');
  console.error('SYNTAX ERROR:', msg);
  process.exit(1);
}

