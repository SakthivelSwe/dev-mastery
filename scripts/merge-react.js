const fs = require('fs');
const b5 = require('./content/react-batch5.js');
const b6 = require('./content/react-batch6.js');
const merged = { ...b5, ...b6 };
console.log('b5+b6 total:', Object.keys(merged).length);
let out = 'module.exports = {\n';
for (const [k, v] of Object.entries(merged)) {
  out +=   ' + k + ': {\n;
  for (const [sk, sv] of Object.entries(v)) {
    out += '    ' + sk + ': ' + JSON.stringify(sv) + ',\n';
  }
  out += '  },\n';
}
out += '};\n';
fs.writeFileSync('./content/react-batch56.js', out, 'utf8');
console.log('Written react-batch56.js');
