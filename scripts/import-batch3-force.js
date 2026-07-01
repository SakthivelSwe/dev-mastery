/*
 * Force-imports java-mastery-batch3 MDX files into the database.
 * Unlike importContentDirect.js, this script IGNORES which learning_path the topic
 * belongs to and just updates/inserts lessons for whatever topic matches the slug.
 *
 * This is needed for the 7 batch3 files whose slugs were originally created under
 * different paths (mongodb, system-design, dsa, typescript, spring-boot).
 *
 * Usage:
 *   node scripts/import-batch3-force.js
 *   node scripts/import-batch3-force.js dfs topological-sort    # specific slugs only
 */

const fs   = require('fs');
const path = require('path');
const { Client } = require('pg');

const CONN         = 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const BATCH3_DIR   = path.join(__dirname, 'java-mastery-batch3');

// MDX heading -> lessons.section_type
const SECTION_MAP = {
    'WHY':                  'why',
    'WHY IT MATTERS':       'why',
    'THEORY':               'theory',
    'HOW IT WORKS':         'theory',
    'VISUALIZATION_CONFIG': 'visual',
    'VISUALIZATION':        'visual',
    'CODE':                 'code',
    'IMPLEMENTATION':       'code',
    'REAL_WORLD':           'realworld',
    'REAL WORLD':           'realworld',
    'INTERVIEW':            'interview',
    'INTERVIEW QUESTIONS':  'interview',
    'FEYNMAN CHECK':        'feynman',
    'FEYNMAN':              'feynman',
    'BUILD':                'build',
    'BUILD CHALLENGE':      'build',
    'SPACED REVIEW':        'spacedreview',
    'REVIEW':               'spacedreview',
};

const SECTION_ORDER = ['why','theory','visual','code','realworld','interview','feynman','build','spacedreview'];

const SECTION_LABEL = {
    why:          'Why It Matters',
    theory:       'Theory & Concepts',
    visual:       'Visualization',
    code:         'Code Examples',
    realworld:    'Real-World Use Cases',
    interview:    'Interview Questions',
    feynman:      'Feynman Check',
    build:        'Build Challenge',
    spacedreview: 'Spaced Review',
};

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
    const out = {};
    const parts = mdx.split(/^## /m);
    for (const part of parts) {
        if (!part.trim()) continue;
        const nl   = part.indexOf('\n');
        const head = (nl > -1 ? part.substring(0, nl) : part).trim().toUpperCase();
        const body = (nl > -1 ? part.substring(nl + 1) : '').trim();
        if (!head) continue;
        const key = SECTION_MAP[head];
        if (key) out[key] = body;
    }
    return out;
}

async function upsertLesson(client, topicId, sectionType, orderIndex, contentMdx) {
    const title    = SECTION_LABEL[sectionType] || sectionType;
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

(async () => {
    const slugFilter = process.argv.length > 2 ? new Set(process.argv.slice(2)) : null;

    const files = fs.readdirSync(BATCH3_DIR).filter(f => f.endsWith('.mdx'));

    const client = new Client({ connectionString: CONN });
    await client.connect();

    const before = await client.query('SELECT COUNT(*) FROM lessons');
    let totalFiles = 0, totalSections = 0;

    for (const file of files) {
        const raw        = fs.readFileSync(path.join(BATCH3_DIR, file), 'utf-8');
        const { fm, body } = parseFrontmatter(raw);
        const slug       = fm.slug || file.replace(/\.mdx$/, '');

        if (slugFilter && !slugFilter.has(slug)) continue;

        // Find topic by slug regardless of path
        const topicRow = await client.query(
            `SELECT t.id, t.slug, lp.slug as path_slug
             FROM topics t
             JOIN learning_paths lp ON lp.id = t.path_id
             WHERE t.slug = $1`,
            [slug]
        );

        if (!topicRow.rows.length) {
            console.warn(`  SKIP  ${slug}  (topic not found in DB - run importContentDirect.js first)`);
            continue;
        }

        const { id: topicId, path_slug } = topicRow.rows[0];
        const sections = parseSections(body);

        if (!Object.keys(sections).length) {
            console.warn(`  SKIP  ${slug}  (no recognised sections in MDX)`);
            continue;
        }

        let inserts = 0, updates = 0;
        for (let i = 0; i < SECTION_ORDER.length; i++) {
            const st = SECTION_ORDER[i];
            if (!sections[st]) continue;
            const op = await upsertLesson(client, topicId, st, i, sections[st]);
            if (op === 'INSERT') inserts++; else updates++;
            totalSections++;
        }

        totalFiles++;
        console.log(
            `  OK    ${slug.padEnd(40)}  path=${path_slug.padEnd(20)}  ` +
            `sections=${Object.keys(sections).length}  ins=${inserts} upd=${updates}`
        );
    }

    const after = await client.query('SELECT COUNT(*) FROM lessons');
    console.log(`\n>> Files processed : ${totalFiles}`);
    console.log(`>> Sections written: ${totalSections}`);
    console.log(`>> lessons rows    : ${before.rows[0].count} -> ${after.rows[0].count}`);

    await client.end();
})().catch(e => { console.error(e); process.exit(1); });

