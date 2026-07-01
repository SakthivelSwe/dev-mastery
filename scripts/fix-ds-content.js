// Fixes the inline backtick syntax errors in design-system-content.js
// Replaces lines like:   **Expected Output:** `text``,
// With:                  **Expected Output:** text`,
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'content', 'design-system-content.js');
let s = fs.readFileSync(file, 'utf-8');
// Match: **Expected Output:** `<anything not backtick>``,
const re = /\*\*Expected Output:\*\* `([^`]+)``,/g;
const before = (s.match(re) || []).length;
s = s.replace(re, (_, txt) => `**Expected Output:** ${txt}\`,`);
fs.writeFileSync(file, s, 'utf-8');
console.log('Replaced', before, 'occurrences');

