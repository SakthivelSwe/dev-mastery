const fs = require('fs');
const lines = fs.readFileSync('C:/AI projects/dev-mastery/scripts/visualizer-configs-js-batch2.js', 'utf8').split('\n');
// Replace line 175 (index 174) with a safe code string using double-quotes
lines[174] = `      code:"const price = 9.99;\\nconst qty = 3;\\n\\\`Total: \\${(price * qty).toFixed(2)}\\\`;\\n// Total: $29.97\\n\\n\\\`Status: \\${isLoggedIn ? 'Welcome' : 'Please log in'}\\\`\\n\\n\\\`Debug: \\${JSON.stringify(obj, null, 2)}\\\`",`;
fs.writeFileSync('C:/AI projects/dev-mastery/scripts/visualizer-configs-js-batch2.js', lines.join('\n'), 'utf8');
console.log('done, line 175:', lines[174]);

