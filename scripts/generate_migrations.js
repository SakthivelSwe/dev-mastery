const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateUuid() {
  return crypto.randomUUID();
}

function parseMarkdown() {
  const planPath = path.join(__dirname, '../DEVMASTERY_ROADMAP_INTEGRATION.md');
  const content = fs.readFileSync(planPath, 'utf8');

  const paths = [];
  
  // Extract paths from the summary table
  const summaryMatch = content.match(/## Summary\s*\| # \| Roadmap \| Topics Count \| Levels \| Priority \|\s*\|---\|---\|---\|---\|---\|([\s\S]*?)---\s*## Flyway Seed Plan/);
  if (!summaryMatch) {
      console.error("Could not find summary table");
      return null;
  }
  
  const pathRegex = /\|\s*\d+\s*\|\s*(.+?)\s*\|\s*(\d+) topics\s*\|\s*(\d+–\d+)\s*\|\s*(.*?)\s*\|/g;
  let match;
  while ((match = pathRegex.exec(summaryMatch[1])) !== null) {
      paths.push({
          title: match[1].trim(),
          topicCount: parseInt(match[2]),
          levelRange: match[3].trim(),
          priority: match[4].trim()
      });
  }

  // The Flyway Seed Plan section actually has the exact INSERT for V10! Let's extract it.
  const v10Regex = /```sql\n(INSERT INTO learning_paths[\s\S]*?);\n```/;
  const v10Match = content.match(v10Regex);
  const v10Sql = v10Match ? v10Match[1] + ';' : null;
  
  // Extracting all topics is harder. Instead of parsing the massive MD, it's safer to generate a skeleton
  // based on the implementation_plan.md where I summarized them nicely.
  
  return { paths, v10Sql };
}

function parseImplementationPlan() {
  const planPath = 'C:\\Users\\sakth\\.gemini\\antigravity-ide\\brain\\ab711485-3dd3-4268-a125-e14f2ac86606\\implementation_plan.md';
  const content = fs.readFileSync(planPath, 'utf8');
  
  const paths = [];
  let currentPath = null;
  
  const lines = content.split('\n');
  for (let line of lines) {
    // Match path header: #### Path 1 — Full Stack (85 topics)
    const pathMatch = line.match(/#### Path \d+ — (.*) \((\d+) topics\)/);
    if (pathMatch) {
      let slug = pathMatch[1].trim().toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
      // Fix known slugs from the table
      if (slug === 'java-mastery') slug = 'java-mastery';
      if (slug === 'dsa') slug = 'dsa';
      // I will map the real slug later from the path definition
      currentPath = { title: pathMatch[1].trim(), slug: slug, levels: {} };
      paths.push(currentPath);
      continue;
    }
    
    // Match level: **Level 1 (8):** `internet-how-it-works`, `what-is-http`, ...
    if (currentPath) {
      const levelMatch = line.match(/\*\*Level (\d+) \(\d+\):\*\* (.*)/);
      if (levelMatch) {
        const level = parseInt(levelMatch[1]);
        const topics = levelMatch[2].split(',').map(s => {
          // Extract text between backticks
          const codeMatch = s.match(/`(.*?)`/);
          return codeMatch ? codeMatch[1] : null;
        }).filter(Boolean);
        currentPath.levels[level] = topics;
      }
    }
  }
  
  // Correct the slugs based on the exact Flyway SQL
  const slugMapping = {
    'full-stack': 'full-stack',
    'java-mastery': 'java-mastery',
    'dsa': 'dsa',
    'leetcode-patterns': 'leetcode-patterns',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'react': 'react',
    'angular': 'angular',
    'spring-boot': 'spring-boot',
    'system-design': 'system-design',
    'api-design': 'api-design',
    'software-architecture': 'software-architecture',
    'html': 'html',
    'css': 'css',
    'sql': 'sql',
    'postgresql-dba': 'postgresql-dba',
    'mongodb': 'mongodb',
    'design-system': 'design-system'
  };
  
  // Map titles to slugs properly (since simple lowercasing might not match exactly)
  for (let p of paths) {
     if (p.title.toLowerCase().includes('full stack')) p.slug = 'full-stack';
     if (p.title.toLowerCase().includes('java')) p.slug = 'java-mastery';
     if (p.title.toLowerCase() === 'dsa') p.slug = 'dsa';
     if (p.title.toLowerCase().includes('leetcode')) p.slug = 'leetcode-patterns';
     if (p.title.toLowerCase().includes('javascript')) p.slug = 'javascript';
     if (p.title.toLowerCase().includes('typescript')) p.slug = 'typescript';
     if (p.title.toLowerCase() === 'react') p.slug = 'react';
     if (p.title.toLowerCase() === 'angular') p.slug = 'angular';
     if (p.title.toLowerCase().includes('spring boot')) p.slug = 'spring-boot';
     if (p.title.toLowerCase().includes('system design')) p.slug = 'system-design';
     if (p.title.toLowerCase().includes('api design')) p.slug = 'api-design';
     if (p.title.toLowerCase().includes('architecture')) p.slug = 'software-architecture';
     if (p.title.toLowerCase() === 'html') p.slug = 'html';
     if (p.title.toLowerCase() === 'css') p.slug = 'css';
     if (p.title.toLowerCase() === 'sql') p.slug = 'sql';
     if (p.title.toLowerCase().includes('postgresql')) p.slug = 'postgresql-dba';
     if (p.title.toLowerCase().includes('mongodb')) p.slug = 'mongodb';
     if (p.title.toLowerCase().includes('design system')) p.slug = 'design-system';
  }
  
  return paths;
}

function getEstimatedMins(level) {
    const mins = {
        1: 25,
        2: 35,
        3: 50,
        4: 60,
        5: 75
    };
    return mins[level] || 30;
}

function formatTitle(slug) {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function generateV11Sql(paths) {
    let sql = `-- =============================================================\n`;
    sql += `-- V11: Seed Data — Topics for all 18 Learning Paths\n`;
    sql += `-- Total ~989 topics\n`;
    sql += `-- =============================================================\n\n`;
    
    let totalTopicsCount = 0;
    const globalSlugs = new Set();

    for (const path of paths) {
        sql += `-- -------------------------------------------------------------\n`;
        sql += `-- Path: ${path.title} (${path.slug})\n`;
        sql += `-- -------------------------------------------------------------\n`;
        sql += `DO $$\nDECLARE path_id UUID;\nBEGIN\n`;
        sql += `  SELECT id INTO path_id FROM learning_paths WHERE slug = '${path.slug}';\n`;
        sql += `  IF path_id IS NOT NULL THEN\n`;
        sql += `    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)\n`;
        sql += `    VALUES\n`;
        
        let orderIndex = 1;
        const values = [];
        
        for (let level = 1; level <= 5; level++) {
            if (!path.levels[level]) continue;
            
            for (let topicSlug of path.levels[level]) {
                const title = formatTitle(topicSlug);
                const mins = getEstimatedMins(level);
                
                // Ensure globally unique slug
                if (globalSlugs.has(topicSlug)) {
                    topicSlug = `${topicSlug}-${path.slug}`;
                }
                globalSlugs.add(topicSlug);
                
                // Visualizer logic
                let hasVis = 'FALSE';
                if (path.slug === 'dsa') {
                    const visList = ['array', 'linked-list', 'stack', 'queue', 'tree', 'heap', 'bfs', 'dfs', 'graph', 'sort'];
                    if (visList.some(v => topicSlug.includes(v))) {
                        hasVis = 'TRUE';
                    }
                }
                
                // Code lab logic - most things have code labs except pure theory/system design
                let hasCodeLab = 'TRUE';
                if (path.slug === 'system-design' || path.slug === 'software-architecture' || path.slug === 'api-design') {
                    hasCodeLab = 'FALSE';
                }
                
                values.push(`      (gen_random_uuid(), path_id, '${topicSlug}', '${title.replace(/'/g, "''")}', ${level}, ${mins}, ${orderIndex}, FALSE, ${hasVis}, ${hasCodeLab})`);
                orderIndex++;
                totalTopicsCount++;
            }
        }
        
        sql += values.join(',\n') + ';\n';
        sql += `  END IF;\nEND $$;\n\n`;
    }
    
    return { sql, totalTopicsCount };
}

function main() {
    const mdData = parseMarkdown();
    if (!mdData || !mdData.v10Sql) {
        console.error("Failed to parse V10 SQL from roadmap integration MD");
    } else {
        // We will append this to V10
        let v10Complete = `-- =============================================================\n`;
        v10Complete += `-- V10: Seed Data — 18 Learning Paths\n`;
        v10Complete += `-- =============================================================\n\n`;
        v10Complete += `-- First, clear out old paths to avoid conflicts if they had different structure\n`;
        v10Complete += `DELETE FROM learning_paths;\n\n`;
        v10Complete += mdData.v10Sql;
        
        fs.writeFileSync(path.join(__dirname, '../services/content-service/src/main/resources/db/migration/V10__seed_18_learning_paths.sql'), v10Complete);
        console.log("Generated V10__seed_18_learning_paths.sql");
    }
    
    const parsedPaths = parseImplementationPlan();
    const { sql: v11Sql, totalTopicsCount } = generateV11Sql(parsedPaths);
    
    fs.writeFileSync(path.join(__dirname, '../services/content-service/src/main/resources/db/migration/V11__seed_topics_all_paths.sql'), v11Sql);
    console.log(`Generated V11__seed_topics_all_paths.sql with ${totalTopicsCount} topics.`);
}

main();
