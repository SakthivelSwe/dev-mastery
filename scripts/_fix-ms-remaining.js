const fs = require('fs');
let src = fs.readFileSync('C:/AI projects/dev-mastery/scripts/visualizer-configs-ms-remaining.js', 'utf8');

// Fix label('...'} -> label:'...'
src = src.replace(/\{label\('([^']*?)'\}/g, (_, t) => `{label:'${t}'}`);
// Fix label('...') -> label:'...'
src = src.replace(/\{label\('([^']*?)'\)/g, (_, t) => `{label:'${t}'`);
// Fix label('...' remaining
src = src.replace(/\{label\('([^']*?)'/g, (_, t) => `{label:'${t}'`);

// Fix step objects ending with , done:true)] -> , done:true},
src = src.replace(/,\s*done:true\s*\)\]/g, ', done:true},');
src = src.replace(/,\s*active:true\s*\)\]/g, ', active:true},');

// Fix sequence from: messages with trailing comma
const lines = src.split('\n');
const out = lines.map((line, i) => {
  if (/^\s+\{from:'.+', to:'.+', label:'.+',\s*$/.test(line)) {
    // check if next non-empty line starts with {from: or ]}
    return line.trimEnd().slice(0, -1) + '},';
  }
  return line;
});
src = out.join('\n');

// Double commas
src = src.replace(/,\s*,/g, ',');

// Fix diagram title(')
src = src.replace(/title\('([^']+)'\)\]/g, "title:'$1' }");

fs.writeFileSync('C:/AI projects/dev-mastery/scripts/visualizer-configs-ms-remaining.js', src);
console.log('done, chars:', src.length);

