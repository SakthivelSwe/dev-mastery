// Fix visualizer config files by LOADING them (require) so we get real JS
// objects, then modifying `diagram` fields in-memory, then writing back.
// This is safer than regex on source because step `code` strings can contain
// arbitrary characters (brackets, quotes, backticks).

const fs = require('node:fs');
const path = require('node:path');

const dir = __dirname;
const files = fs
  .readdirSync(dir)
  .filter((f) => /^visualizer-configs-.*\.js$/.test(f))
  .map((f) => path.join(dir, f));

function normalizeDiagram(d) {
  if (!d || typeof d !== 'object' || !d.kind) return d;
  switch (d.kind) {
    case 'flow': {
      const raw = Array.isArray(d.steps) ? d.steps : [];
      return {
        kind: 'flow',
        steps: raw.map((s) =>
          typeof s === 'string' ? { label: s } : (s && s.label ? s : { label: String(s ?? '') }),
        ),
      };
    }
    case 'boxes': {
      const rawItems = Array.isArray(d.items) ? d.items : Array.isArray(d.boxes) ? d.boxes : [];
      const items = rawItems.map((b) => {
        if (typeof b === 'string') return { label: b };
        if (b && typeof b === 'object' && b.label) {
          const out = { label: b.label };
          if (b.value !== undefined) out.value = b.value;
          if (b.highlight !== undefined) out.highlight = b.highlight;
          if (b.color !== undefined) out.color = b.color;
          return out;
        }
        return { label: String(b ?? '') };
      });
      const out = { kind: 'boxes' };
      if (d.title !== undefined) out.title = d.title;
      out.items = items;
      return out;
    }
    default:
      return d;
  }
}

let scanned = 0;
let modified = 0;
const issues = [];

for (const file of files) {
  scanned++;
  delete require.cache[require.resolve(file)];
  let topics;
  try {
    topics = require(file);
  } catch (e) {
    issues.push(`SKIP  ${path.basename(file)}: ${e.message}`);
    continue;
  }
  if (!Array.isArray(topics)) continue;

  let touchedThisFile = false;
  for (const t of topics) {
    for (const st of t.steps ?? []) {
      if (!st.diagram) continue;
      const before = JSON.stringify(st.diagram);
      st.diagram = normalizeDiagram(st.diagram);
      if (JSON.stringify(st.diagram) !== before) touchedThisFile = true;
    }
  }

  if (!touchedThisFile) continue;

  const lines = [];
  lines.push('module.exports = [');
  topics.forEach((t, ti) => {
    lines.push('  {');
    lines.push(`    path: ${JSON.stringify(t.path)}, slug: ${JSON.stringify(t.slug)},`);
    lines.push('    steps: [');
    t.steps.forEach((st, si) => {
      const parts = [];
      parts.push(`title: ${JSON.stringify(st.title)}`);
      parts.push(`description: ${JSON.stringify(st.description)}`);
      if (st.code !== undefined) parts.push(`code: ${JSON.stringify(st.code)}`);
      if (st.language) parts.push(`language: ${JSON.stringify(st.language)}`);
      if (st.highlight) parts.push(`highlight: ${JSON.stringify(st.highlight)}`);
      if (st.diagram) parts.push(`diagram: ${JSON.stringify(st.diagram)}`);
      lines.push('      { ' + parts.join(', ') + ' }' + (si < t.steps.length - 1 ? ',' : ''));
    });
    lines.push('    ]');
    lines.push('  }' + (ti < topics.length - 1 ? ',' : ''));
  });
  lines.push('];');
  lines.push('');

  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  modified++;
}

console.log(`Scanned : ${scanned}`);
console.log(`Modified: ${modified}`);
if (issues.length) console.log('Issues:\n' + issues.join('\n'));

