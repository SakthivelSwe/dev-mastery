const fs = require('fs');
const path = require('path');

const INTEGRATION_MD_PATH = path.join(__dirname, '../DEVMASTERY_ROADMAP_INTEGRATION_part_3.md');
const CONTENT_OUT_DIR = path.join(__dirname, '../apps/web/content');

function getActualFiles() {
    const actual = new Set();
    const dirs = fs.readdirSync(CONTENT_OUT_DIR);
    for (const d of dirs) {
        const fullPath = path.join(CONTENT_OUT_DIR, d);
        if (fs.statSync(fullPath).isDirectory()) {
            const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.mdx'));
            files.forEach(f => actual.add(f.replace('.mdx', '')));
        }
    }
    return actual;
}

function analyzeProgress() {
    const content = fs.readFileSync(INTEGRATION_MD_PATH, 'utf-8');
    const lines = content.split('\n');
    
    // The master list is between lines 62 and 1770
    const masterListContent = lines.slice(61, 1770).join('\n');
    
    const actualFiles = getActualFiles();
    let totalExpected = 0;
    let totalMissing = 0;
    const missingSlugs = [];

    // Match lines starting with a slug and having 2+ spaces
    const topicRegex = /^([a-z0-9-]+)\s{2,}.*?$/gm;
    let match;

    while ((match = topicRegex.exec(masterListContent)) !== null) {
        const slug = match[1];
        if (slug.length < 3) continue;
        
        totalExpected++;
        if (!actualFiles.has(slug)) {
            totalMissing++;
            missingSlugs.push(slug);
        }
    }
    
    console.log(`\n=== OVERALL PROGRESS ===`);
    console.log(`Total Expected Roadmap Topics: ${totalExpected}`);
    console.log(`Total Generated .mdx Files (overall): ${actualFiles.size}`);
    console.log(`Total Missing From Master List: ${totalMissing}`);
    
    console.log(`\n=== MISSING TOPICS LIST ===`);
    console.log(missingSlugs.join(', '));
}

analyzeProgress();
