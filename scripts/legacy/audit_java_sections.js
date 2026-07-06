/*
 * Audit every java-mastery .mdx file: show which of the 9 canonical sections are present/missing.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'apps', 'web', 'content', 'java-mastery');
const SECTION_MAP = {
    'WHY':'why','WHY IT MATTERS':'why',
    'THEORY':'theory','HOW IT WORKS':'theory',
    'VISUALIZATION_CONFIG':'visual','VISUALIZATION':'visual',
    'CODE':'code','IMPLEMENTATION':'code',
    'REAL_WORLD':'realworld','REAL WORLD':'realworld',
    'INTERVIEW':'interview','INTERVIEW QUESTIONS':'interview',
    'FEYNMAN CHECK':'feynman','FEYNMAN':'feynman',
    'BUILD':'build','BUILD CHALLENGE':'build',
    'SPACED REVIEW':'spacedreview','REVIEW':'spacedreview',
};
const ORDER = ['why','theory','visual','code','realworld','interview','feynman','build','spacedreview'];

// Java-mastery owned slugs (from DB)
const JAVA_SLUGS = new Set([
 'java-intro','data-types-and-variables','operators-and-expressions','control-flow','arrays','strings','methods',
 'oop-intro','inheritance','polymorphism','abstraction','interfaces','encapsulation','inner-classes','enums','generics',
 'collections-overview','arraylist-vs-linkedlist','hashmap-internals','treemap-and-treeset','linkedhashmap','priorityqueue',
 'iterator-pattern','lambda-expressions','streams-api','optional','functional-interfaces','comparator-and-comparable',
 'exception-handling','concurrency-basics','executorservice','concurrency-utilities','concurrent-collections',
 'java-memory-model','garbage-collection','reflection','annotations','io-and-nio','serialization',
 'jvm-architecture','virtual-threads','records-and-sealed-classes','design-patterns-in-java','java-modules',
 'performance-tuning','testing-best-practices','build-tools','garbage-collection-mechanics'
]);

function sectionsOf(raw) {
    const out = new Set();
    const idx = raw.indexOf('---', 3);
    const body = idx > -1 ? raw.substring(idx + 3) : raw;
    for (const part of body.split(/^## /m)) {
        const nl = part.indexOf('\n');
        const head = (nl > -1 ? part.substring(0, nl) : part).trim().toUpperCase();
        const k = SECTION_MAP[head];
        if (k) out.add(k);
    }
    return out;
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.mdx'));
const rows = [];
for (const f of files) {
    const slug = f.replace(/\.mdx$/, '');
    if (!JAVA_SLUGS.has(slug)) continue;
    const raw = fs.readFileSync(path.join(DIR, f), 'utf-8');
    const lines = raw.split('\n').length;
    const present = sectionsOf(raw);
    const missing = ORDER.filter(s => !present.has(s));
    rows.push({ slug, lines, have: present.size, missing });
}
rows.sort((a, b) => a.have - b.have || a.lines - b.lines);
console.log('slug'.padEnd(34), 'lines'.padStart(6), 'have'.padStart(5), 'missing');
console.log('-'.repeat(90));
for (const r of rows) {
    console.log(r.slug.padEnd(34), String(r.lines).padStart(6), String(r.have).padStart(5),
                r.missing.length ? r.missing.join(',') : '(complete)');
}
console.log('-'.repeat(90));
console.log('TOTAL java files:', rows.length,
            ' complete-9:', rows.filter(r => r.have === 9).length,
            ' incomplete:',  rows.filter(r => r.have < 9).length);

