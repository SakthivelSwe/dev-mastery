import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../content');
const API_BASE = 'http://localhost:8082/admin';

async function importAllContent() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log(`Directory ${CONTENT_DIR} does not exist. Nothing to import.`);
    return;
  }
  
  const paths = fs.readdirSync(CONTENT_DIR);
  
  let batchPayload = [];
  const MAX_BATCH_SIZE = 50;

  for (const pathSlug of paths) {
    const topicsDir = path.join(CONTENT_DIR, pathSlug);
    if (!fs.statSync(topicsDir).isDirectory()) continue;
    
    const mdxFiles = fs.readdirSync(topicsDir).filter(f => f.endsWith('.mdx'));
    
    for (const file of mdxFiles) {
      const raw = fs.readFileSync(path.join(topicsDir, file), 'utf-8');
      
      const parsed = parseFrontmatter(raw);
      if (!parsed.frontmatter.slug) {
        console.warn(`Skipping ${file} - no slug in frontmatter`);
        continue;
      }
      
      // Split content into 9 sections by ## headings
      const sections = parseSections(parsed.content);
      
      // Check if the file uses standard DevMastery headings
      const hasStandardFormat = !!(sections['WHY'] || sections['THEORY'] || sections['CODE']);

      const topicImport = {
        slug: parsed.frontmatter.slug,
        layers: hasStandardFormat ? {
            why:          sections['WHY'] || sections['WHY IT MATTERS'] || '',
            theory:       sections['THEORY'] || sections['HOW IT WORKS'] || '',
            visual:       sections['VISUALIZATION_CONFIG'] || sections['VISUALIZATION'] || '',
            code:         sections['CODE'] || sections['IMPLEMENTATION'] || '',
            realWorld:    sections['REAL_WORLD'] || sections['REAL WORLD'] || '',
            interview:    sections['INTERVIEW'] || sections['INTERVIEW QUESTIONS'] || '',
            feynman:      sections['FEYNMAN CHECK'] || sections['FEYNMAN'] || '',
            build:        sections['BUILD'] || sections['BUILD CHALLENGE'] || '',
            spacedReview: sections['SPACED REVIEW'] || sections['REVIEW'] || ''
        } : {
            // Legacy format: put entire content into theory layer as fallback
            why:          '',
            theory:       parsed.content,
            visual:       '',
            code:         '',
            realWorld:    '',
            interview:    '',
            feynman:      '',
            build:        '',
            spacedReview: ''
        }
      };

      batchPayload.push(topicImport);

      if (batchPayload.length >= MAX_BATCH_SIZE) {
        await sendBatch(batchPayload);
        batchPayload = []; // reset
      }
    }
  }

  // Send any remaining items
  if (batchPayload.length > 0) {
    await sendBatch(batchPayload);
  }
}

async function sendBatch(topics: any[]) {
  console.log(`Sending batch of ${topics.length} topics...`);
  const adminJwt = jwt.sign({ sub: 'admin-user', roles: ['ADMIN'] }, 'devmastery_dev_jwt_secret_change_in_prod_min_32_chars');
  
  try {
    const response = await fetch(`${API_BASE}/topics/layers/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminJwt}`
      },
      body: JSON.stringify({ topics })
    });
    
    if (response.ok) {
      console.log(`✅ Successfully imported batch of ${topics.length} topics`);
    } else {
      console.error(`❌ Failed to import batch. Status: ${response.status}`);
      const text = await response.text();
      console.error(`Response: ${text}`);
    }
  } catch (err) {
    console.error(`❌ Error connecting to API during batch:`, err);
  }
}

function parseFrontmatter(raw: string) {
  let content = raw;
  const frontmatter: Record<string, string> = {};
  
  if (raw.startsWith('---')) {
    const endIdx = raw.indexOf('---', 3);
    if (endIdx > -1) {
      const fmStr = raw.substring(3, endIdx);
      content = raw.substring(endIdx + 3).trim();
      
      fmStr.split('\n').forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > -1) {
          const key = line.substring(0, colonIdx).trim();
          let val = line.substring(colonIdx + 1).trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          frontmatter[key] = val;
        }
      });
    }
  }
  return { frontmatter, content };
}

function parseSections(mdx: string): Record<string, string> {
  const sections: Record<string, string> = {};
  // Split on ^##  (multiline)
  const parts = mdx.split(/^## /m);
  
  for (const part of parts) {
    if (!part.trim()) continue;
    const lines = part.split('\n');
    const heading = lines[0].trim().toUpperCase();
    const body = lines.slice(1).join('\n').trim();
    if (heading) sections[heading] = body;
  }
  
  return sections;
}

importAllContent().catch(console.error);
