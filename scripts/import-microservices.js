/**
 * Direct importer for microservices MDX files to Supabase.
 * Reads all 28 MDX files in apps/web/content/microservices/
 * and UPSERTs all 9 lessons per topic.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const CONN = 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const CONTENT_DIR = path.join(__dirname, '..', 'apps', 'web', 'content', 'microservices');
const PATH_SLUG = 'microservices';

const SECTION_MAP = {
  'WHY': 'why',
  'WHY IT MATTERS': 'why',
  'THEORY': 'theory',
  'HOW IT WORKS': 'theory',
  'VISUALIZATION_CONFIG': 'visual',
  'VISUALIZATION': 'visual',
  'CODE': 'code',
  'REAL_WORLD': 'realworld',
  'REAL WORLD': 'realworld',
  'INTERVIEW': 'interview',
  'FEYNMAN CHECK': 'feynman',
  'FEYNMAN': 'feynman',
  'BUILD': 'build',
  'SPACED REVIEW': 'spacedreview',
  'SPACED_REVIEW': 'spacedreview',
};

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  const meta = {};
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':');
    if (k) meta[k.trim()] = v.join(':').trim().replace(/^["']|["']$/g, '');
  });
  return { meta, body: match[2] };
}

function parseSections(body) {
  const sections = {};
  const parts = body.split(/\n(?=## )/);
  for (const part of parts) {
    const match = part.match(/^## (.+)\n([\s\S]*)/);
    if (!match) continue;
    const heading = match[1].trim().toUpperCase();
    const content = match[2].trim();
    const type = SECTION_MAP[heading];
    if (type) sections[type] = content;
  }
  return sections;
}

async function main() {
  const client = new Client({ connectionString: CONN });
  await client.connect();
  console.log('Connected to Supabase');

  // Get the path ID
  const pathResult = await client.query(
    "SELECT id FROM learning_paths WHERE slug = $1", [PATH_SLUG]
  );
  if (pathResult.rows.length === 0) {
    throw new Error('Learning path not found: ' + PATH_SLUG);
  }
  const pathId = pathResult.rows[0].id;
  console.log(`Path ID: ${pathId}`);

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
  console.log(`Processing ${files.length} MDX files...`);

  let topicsOk = 0, lessonsOk = 0, errors = 0;

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = parseFrontmatter(raw);
    if (!parsed) { console.log(`SKIP: ${file} (no frontmatter)`); continue; }

    const { meta, body } = parsed;
    const slug = meta.slug || file.replace('.mdx', '');
    const title = meta.title || slug;
    const level = parseInt(meta.level || '2');

    const sections = parseSections(body);
    const sectionCount = Object.keys(sections).length;

    try {
      // Upsert topic
      const topicResult = await client.query(`
        INSERT INTO topics (path_id, slug, title, level, order_index)
        VALUES ($1, $2, $3, $4, (
          SELECT COALESCE(MAX(order_index), 0) + 1 FROM topics WHERE path_id = $1
        ))
        ON CONFLICT (path_id, slug) DO UPDATE
        SET title = EXCLUDED.title, level = EXCLUDED.level
        RETURNING id
      `, [pathId, slug, title, level]);
      const topicId = topicResult.rows[0].id;
      topicsOk++;

      // Upsert each lesson
      let topicLessons = 0;
      for (const [sectionType, content] of Object.entries(sections)) {
        await client.query(`
          INSERT INTO lessons (topic_id, section_type, content)
          VALUES ($1, $2, $3)
          ON CONFLICT (topic_id, section_type) DO UPDATE SET content = EXCLUDED.content
        `, [topicId, sectionType, content]);
        lessonsOk++;
        topicLessons++;
      }

      console.log(`  OK  ${slug.padEnd(40)} ${topicLessons}/9 sections`);
    } catch (err) {
      console.error(`  ERR ${slug}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n=== Import Complete ===`);
  console.log(`Topics: ${topicsOk}/${files.length}`);
  console.log(`Lessons: ${lessonsOk}`);
  console.log(`Errors: ${errors}`);

  // Verify
  const verify = await client.query(`
    SELECT COUNT(*) as lessons FROM lessons l
    JOIN topics t ON l.topic_id = t.id
    WHERE t.path_id = $1
  `, [pathId]);
  console.log(`\nDB lessons for microservices: ${verify.rows[0].lessons}`);

  await client.end();
}

main().catch(err => { console.error('FATAL:', err.message); process.exit(1); });

