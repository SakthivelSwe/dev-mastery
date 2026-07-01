/*
 * Direct Supabase Postgres importer for dev-mastery MDX content.
 * - Reads every .mdx file in a content directory (default: apps/web/content/java-mastery).
 * - Parses front-matter (slug/title/level).
 * - Splits the MDX body by "## " headings into 9 canonical sections.
 * - UPSERTs the `topics` row and each section as a `lessons` row.
 *
 * Usage:
 *   node scripts/importContentDirect.js                       # imports java-mastery only
 *   node scripts/importContentDirect.js java-mastery          # explicit
 *   node scripts/importContentDirect.js java-mastery polymorphism iterator-pattern   # specific slugs
 */

const fs   = require('fs');
const path = require('path');
const { Client } = require('pg');
const { randomUUID } = require('crypto');

const CONN = 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const CONTENT_ROOT = path.join(__dirname, '..', 'apps', 'web', 'content');

// MDX heading -> lessons.section_type
const SECTION_MAP = {
    'WHY':                 'why',
    'WHY IT MATTERS':      'why',
    'THEORY':              'theory',
    'HOW IT WORKS':        'theory',
    'VISUALIZATION_CONFIG':'visual',
    'VISUALIZATION':       'visual',
    'CODE':                'code',
    'IMPLEMENTATION':      'code',
    'REAL_WORLD':          'realworld',
    'REAL WORLD':          'realworld',
    'INTERVIEW':           'interview',
    'INTERVIEW QUESTIONS': 'interview',
    'FEYNMAN CHECK':       'feynman',
    'FEYNMAN':             'feynman',
    'BUILD':               'build',
    'BUILD CHALLENGE':     'build',
    'SPACED REVIEW':       'spacedreview',
    'REVIEW':              'spacedreview',
};

// Ordering used when writing lesson rows
const SECTION_ORDER = ['why','theory','visual','code','realworld','interview','feynman','build','spacedreview'];

function parseFrontmatter(raw) {
    const fm = {};
    let body = raw;
    if (raw.startsWith('---')) {
        const end = raw.indexOf('---', 3);
        if (end > -1) {
            const head = raw.substring(3, end);
            body = raw.substring(end + 3).trim();
            for (const line of head.split('\n')) {
                const idx = line.indexOf(':');
                if (idx < 0) continue;
                const k = line.substring(0, idx).trim();
                let v = line.substring(idx + 1).trim();
                if ((v.startsWith('"') && v.endsWith('"')) ||
                    (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
                fm[k] = v;
            }
        }
    }
    return { fm, body };
}

function parseSections(mdx) {
    // Split on lines that start with "## "
    const out = {};
    const parts = mdx.split(/^## /m);
    for (const part of parts) {
        if (!part.trim()) continue;
        const nl  = part.indexOf('\n');
        const head = (nl > -1 ? part.substring(0, nl) : part).trim().toUpperCase();
        const body = (nl > -1 ? part.substring(nl + 1) : '').trim();
        if (!head) continue;
        const key = SECTION_MAP[head];
        if (key) out[key] = body;
    }
    return out;
}

function humanTitle(slug) {
    return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

const SECTION_LABEL = {
    why:         'Why It Matters',
    theory:      'Theory & Concepts',
    visual:      'Visualization',
    code:        'Code Examples',
    realworld:   'Real-World Use Cases',
    interview:   'Interview Questions',
    feynman:     'Feynman Check',
    build:       'Build Challenge',
    spacedreview:'Spaced Review',
};

async function getPathId(client, pathSlug) {
    const r = await client.query('SELECT id FROM learning_paths WHERE slug = $1', [pathSlug]);
    if (!r.rows.length) throw new Error(`learning_paths row missing for slug ${pathSlug}`);
    return r.rows[0].id;
}

async function ensureTopic(client, slug, title, level, pathId) {
    const r = await client.query('SELECT id FROM topics WHERE slug = $1', [slug]);
    if (r.rows.length) return r.rows[0].id;
    const id = randomUUID();
    await client.query(
        `INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index,
                              has_visualizer, has_code_lab, is_published, tags, prerequisite_ids,
                              created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5, 20, 999, false, false, true, '{}', '{}', now(), now())`,
        [id, pathId, slug, title, level || 1]
    );
    return id;
}

async function upsertLesson(client, topicId, sectionType, orderIndex, contentMdx) {
    const title = SECTION_LABEL[sectionType] || sectionType;
    const existing = await client.query(
        'SELECT id FROM lessons WHERE topic_id = $1 AND section_type = $2',
        [topicId, sectionType]
    );
    if (existing.rows.length) {
        await client.query(
            `UPDATE lessons
             SET content_mdx = $1, title = $2, order_index = $3,
                 is_published = true, updated_at = now()
             WHERE id = $4`,
            [contentMdx, title, orderIndex, existing.rows[0].id]
        );
        return 'UPDATE';
    }
    await client.query(
        `INSERT INTO lessons
            (id, topic_id, section_type, title, content_mdx, order_index,
             is_published, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, now(), now())`,
        [topicId, sectionType, title, contentMdx, orderIndex]
    );
    return 'INSERT';
}

// Optional whitelist: only import slugs that already belong to the target path
// (prevents cross-listed files from being relocated under the wrong learning path).
async function getPathSlugSet(client, pathId) {
    const r = await client.query('SELECT slug FROM topics WHERE path_id = $1', [pathId]);
    return new Set(r.rows.map(x => x.slug));
}

async function importDir(client, pathSlug, slugFilter) {
    const dir = path.join(CONTENT_ROOT, pathSlug);
    if (!fs.existsSync(dir)) {
        console.error('Directory missing:', dir);
        return { files: 0, sections: 0 };
    }
    const pathId  = await getPathId(client, pathSlug);
    const ownSet  = await getPathSlugSet(client, pathId);     // slugs already belonging to this path
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
    let totalSections = 0;
    let totalFiles    = 0;
    for (const file of files) {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
        const { fm, body } = parseFrontmatter(raw);
        const slug = fm.slug || file.replace(/\.mdx$/, '');
        if (slugFilter && slugFilter.size && !slugFilter.has(slug)) continue;
        // If a slug exists in another path, skip it here so we never reassign it.
        const otherPath = await client.query(
            'SELECT path_id FROM topics WHERE slug = $1',
            [slug]
        );
        if (otherPath.rows.length && otherPath.rows[0].path_id !== pathId) {
            console.log(`  SKIP  ${slug.padEnd(40)}  (belongs to a different path)`);
            continue;
        }
        const title = fm.title || humanTitle(slug);
        const level = parseInt(fm.level, 10) || 1;
        const sections = parseSections(body);
        if (!Object.keys(sections).length) {
            console.warn(`  SKIP  ${slug}  (no recognised sections)`);
            continue;
        }
        const topicId = await ensureTopic(client, slug, title, level, pathId);
        let inserts = 0, updates = 0;
        for (let i = 0; i < SECTION_ORDER.length; i++) {
            const st = SECTION_ORDER[i];
            if (!sections[st]) continue;
            const op = await upsertLesson(client, topicId, st, i, sections[st]);
            if (op === 'INSERT') inserts++; else updates++;
            totalSections++;
        }
        totalFiles++;
        console.log(`  OK    ${slug.padEnd(40)}  sections=${Object.keys(sections).length}  ins=${inserts} upd=${updates}`);
    }
    return { files: totalFiles, sections: totalSections };
}

(async () => {
    const args = process.argv.slice(2);
    const pathSlug = args[0] || 'java-mastery';
    const slugFilter = args.length > 1 ? new Set(args.slice(1)) : null;
    const client = new Client({ connectionString: CONN });
    await client.connect();
    console.log(`>> Importing  ${pathSlug}${slugFilter ? ` (filter: ${[...slugFilter].join(', ')})` : ''}`);
    const before = await client.query('SELECT COUNT(*) FROM lessons');
    const stats = await importDir(client, pathSlug, slugFilter);
    const after  = await client.query('SELECT COUNT(*) FROM lessons');
    console.log(`>> Files: ${stats.files}   Sections written: ${stats.sections}`);
    console.log(`>> lessons rows: ${before.rows[0].count} -> ${after.rows[0].count}`);
    await client.end();
})().catch(e => { console.error(e); process.exit(1); });




