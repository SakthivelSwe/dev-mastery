const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.dev') });
dotenv.config(); // fallback to .env if .env.dev doesn't exist

// Collect all available keys
const apiKeys = [];
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') apiKeys.push(process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY_2 && process.env.GEMINI_API_KEY_2 !== 'YOUR_GEMINI_API_KEY_HERE') apiKeys.push(process.env.GEMINI_API_KEY_2);
if (process.env.GEMINI_API_KEY_3 && process.env.GEMINI_API_KEY_3 !== 'YOUR_GEMINI_API_KEY_HERE') apiKeys.push(process.env.GEMINI_API_KEY_3);

if (apiKeys.length === 0) {
  console.error("❌ No GEMINI_API_KEY is set. Please set it in your .env or .env.dev file.");
  process.exit(1);
}

const INTEGRATION_MD_PATH = path.join(__dirname, '../DEVMASTERY_ROADMAP_INTEGRATION_part_3.md');
const CONTENT_OUT_DIR = path.join(__dirname, '../apps/web/content');

// Helper to extract a batch prompt block from the markdown file
function extractBatchPrompt(batchName) {
  if (!fs.existsSync(INTEGRATION_MD_PATH)) {
    console.error(`❌ Cannot find ${INTEGRATION_MD_PATH}`);
    return null;
  }
  
  const content = fs.readFileSync(INTEGRATION_MD_PATH, 'utf-8');
  
  const startRegex = new RegExp(`### BATCH PROMPT ${batchName} — .*?\\n.*?\\n\`\`\``, 's');
  const startMatch = startRegex.exec(content);
  
  if (!startMatch) {
    return null;
  }
  
  const startIndex = startMatch.index + startMatch[0].length;
  const endIndex = content.indexOf('```', startIndex);
  
  if (endIndex === -1) {
    return null;
  }
  
  return content.substring(startIndex, endIndex).trim();
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Exportable run function that handles retries and key rotation
async function runBatch(batchName, pathSlug, keyIndex = 0) {
  console.log(`\n🚀 [Key ${keyIndex + 1}] Starting Generation for Batch ${batchName}...`);
  
  const prompt = extractBatchPrompt(batchName);
  if (!prompt) {
      console.log(`⚠️ Batch ${batchName} not found in markdown.`);
      return false; // Not an error, just means we reached the end of batches for this path
  }

  const targetDir = path.join(CONTENT_OUT_DIR, pathSlug);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`📡 [Key ${keyIndex + 1}] Sending request to Gemini for Batch ${batchName}...`);
  
  const ai = new GoogleGenAI({ apiKey: apiKeys[keyIndex] });
  const explicitInstruction = `\n\nCRITICAL INSTRUCTION FOR OUTPUT FORMAT: You MUST output each topic EXACTLY with the following delimiter before it: "=== TOPIC: <slug> ===" where <slug> is the exact slug of the topic (e.g. === TOPIC: java-memory-model ===). Do NOT use markdown headings like "# TOPIC 1" for the delimiter. Only use the exact string === TOPIC: slug === on its own line.`;
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt + explicitInstruction,
        config: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            systemInstruction: "You are an expert developer and technical writer. Provide extremely deep, advanced, and highly detailed knowledge suitable for top-tier senior developers. Prioritize core concepts, internal mechanics, and strong advanced patterns. Never provide superficial answers.",
        }
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("No text returned from Gemini");
    }

    const segments = text.split(/===\s*TOPIC:\s*([a-zA-Z0-9-]+)\s*===/i);
    let savedCount = 0;
    for (let i = 1; i < segments.length; i += 2) {
      const slug = segments[i].trim();
      let content = segments[i + 1].trim();
      
      if (content.startsWith('```markdown')) content = content.substring(11).trim();
      else if (content.startsWith('```mdx')) content = content.substring(6).trim();
      else if (content.startsWith('```')) content = content.substring(3).trim();
      
      if (content.endsWith('```')) {
        const lastIndex = content.lastIndexOf('```');
        content = content.substring(0, lastIndex).trim();
      }
      
      const filePath = path.join(targetDir, `${slug}.mdx`);
      if (!content.startsWith('---')) {
         content = `---\ntitle: ${slug}\nslug: ${slug}\n---\n\n${content}`;
      }
      
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Saved: ${filePath}`);
      savedCount++;
    }

    console.log(`\n🏁 Finished Batch ${batchName}. Saved ${savedCount} topics.`);
    return true; // Success

  } catch (error) {
    const errMsg = error.message || String(error);
    
    // Ignore harmless markdown missing errors (this just means end of path)
    if (errMsg.includes("No text returned from Gemini")) {
        console.warn(`⚠️ [Key ${keyIndex + 1}] Gemini returned empty text for Batch ${batchName}. Skipping...`);
        return true; // Pretend success so we don't infinitely retry a bad prompt
    }

    // For ALL other errors (429, 503, Socket hangs, Network drops), we treat it as an overload and rotate keys
    console.warn(`⏳ [Key ${keyIndex + 1}] API Error (${errMsg.substring(0, 40)}...). Failing over/Sleeping for Batch ${batchName}.`);
    
    // If we have another key to try, failover immediately
    if (keyIndex + 1 < apiKeys.length) {
        console.log(`🔄 Failing over to Key ${keyIndex + 2} for Batch ${batchName}...`);
        return runBatch(batchName, pathSlug, keyIndex + 1);
    } else {
        // All keys exhausted, wait 30 seconds and retry
        console.log(`😴 Servers overloaded or keys exhausted. Sleeping for 30s before retrying Batch ${batchName}...`);
        await sleep(30000);
        return runBatch(batchName, pathSlug, 0);
    }
  }
}

// Export for orchestrator
module.exports = { runBatch };

// Direct execution (if run directly via npx tsx scripts/generateContent.ts)
if (require.main === module) {
    const args = process.argv.slice(2);
    let batchLetter = "A";
    let pathSlug = "java-mastery";

    if (args.length >= 2) {
        batchLetter = args[0];
        pathSlug = args[1];
    }

    runBatch(batchLetter, pathSlug).then(() => {
        console.log("Execution completed.");
    }).catch(err => {
        console.error("Execution failed:", err);
    });
}
