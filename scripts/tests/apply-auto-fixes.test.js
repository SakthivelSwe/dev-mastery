#!/usr/bin/env node
/**
 * Test for scripts/apply-auto-fixes.js — verifies the section splicer
 * correctly replaces named sections without touching untouched ones.
 * Run with: node scripts/tests/apply-auto-fixes.test.js
 */

'use strict';

const assert = require('node:assert/strict');
const { extractSections, spliceSections } = require('../apply-auto-fixes');

const SAMPLE_MDX = `---
slug: "sample"
title: "Sample"
level: 2
---

## WHY

Original why paragraph.

## THEORY

Original theory content.

## CODE

Original code samples.

## INTERVIEW

Original interview Q&A.
`;

const SAMPLE_PROPOSAL = `# Auto-fix proposal for x/sample

> ...header metadata...

---

## THEORY

Fresh theory content with a Mermaid diagram.

## INTERVIEW

Q1: Rewritten interview content.
Q2: Second question.
`;

function testExtractSections() {
  const s = extractSections(SAMPLE_PROPOSAL);
  assert.deepEqual(Object.keys(s), ['## THEORY', '## INTERVIEW']);
  assert.match(s['## THEORY'], /Fresh theory content/);
  assert.match(s['## INTERVIEW'], /Q2: Second question/);
  console.log('  ✅ extractSections');
}

function testSpliceReplacesTargetedSections() {
  const proposed = extractSections(SAMPLE_PROPOSAL);
  const out = spliceSections(SAMPLE_MDX, proposed);

  // Untouched sections remain.
  assert.match(out, /Original why paragraph\./,   'WHY must be preserved');
  assert.match(out, /Original code samples\./,    'CODE must be preserved');

  // Targeted sections replaced.
  assert.match(out, /Fresh theory content/,       'THEORY must be rewritten');
  assert.match(out, /Q2: Second question/,        'INTERVIEW must be rewritten');
  assert.doesNotMatch(out, /Original theory content/,   'old THEORY must be gone');
  assert.doesNotMatch(out, /Original interview Q&A\./,  'old INTERVIEW must be gone');

  // Frontmatter intact.
  assert.match(out, /^---\nslug: "sample"/,       'frontmatter preserved');
  console.log('  ✅ spliceSections replaces targeted sections only');
}

function testSpliceAppendsMissingSections() {
  const proposed = extractSections(`
## FEYNMAN CHECK
New Feynman analogy + 5 Q&As.
`);
  const out = spliceSections(SAMPLE_MDX, proposed);
  assert.match(out, /## FEYNMAN CHECK\n\nNew Feynman analogy/);
  console.log('  ✅ spliceSections appends missing sections');
}

function testSpliceNoOpOnEmptyProposal() {
  const out = spliceSections(SAMPLE_MDX, {});
  assert.equal(out, SAMPLE_MDX);
  console.log('  ✅ spliceSections is a no-op for empty proposals');
}

console.log('apply-auto-fixes.test.js');
testExtractSections();
testSpliceReplacesTargetedSections();
testSpliceAppendsMissingSections();
testSpliceNoOpOnEmptyProposal();
console.log('\nAll splicer tests passed.');

