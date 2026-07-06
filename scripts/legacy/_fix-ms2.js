const fs = require('fs');
let src = fs.readFileSync('C:/AI projects/dev-mastery/scripts/visualizer-configs-ms-remaining.js', 'utf8');

// Fix diagram:{ kind:'...' }, items:[ -> diagram:{ kind:'...', items:[
src = src.replace(/diagram:\{ kind:'([^']+)', title:'([^']*)' \}, items:\[/g, function(m,k,t) {
  return "diagram:{ kind:'" + k + "', title:'" + t + "', items:[";
});
src = src.replace(/diagram:\{ kind:'([^']+)' \}, items:\[/g, function(m,k) {
  return "diagram:{ kind:'" + k + "', items:[";
});

// Fix stray ) after color/highlight/value values before ], or }
src = src.replace(/, color:'([^']+)'\)\]/g, ", color:'$1'},");
src = src.replace(/, highlight:true\)\]/g, ", highlight:true},");
src = src.replace(/, value:'([^']+)'\)\]/g, ", value:'$1'},");
src = src.replace(/, done:true\)\]/g, ", done:true},");
src = src.replace(/, active:true\)\]/g, ", active:true},");

// Fix stray ) at end of string-only lines: 'text') -> 'text'
src = src.replace(/'([^']*?)'\)(\s*[,\}])/g, "'$1'$2");

// Fix last step in flow steps that has trailing comma instead of nothing
// Pattern: {label:'...',\n  ]}} -> {label:'...'\n  ]}}
src = src.replace(/(\{label:'[^']+'),\s*\n(\s+\]\}\})/g, function(m, item, ending) {
  return item + '\n' + ending;
});

// Double commas
src = src.replace(/,\s*,/g, ',');

fs.writeFileSync('C:/AI projects/dev-mastery/scripts/visualizer-configs-ms-remaining.js', src);
console.log('done, chars:', src.length);

