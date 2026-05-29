const { runBatch } = require('./generateContent');

const PATH_SLUGS = [
  'full-stack',
  'java-mastery',
  'dsa',
  'leetcode-patterns',
  'javascript',
  'typescript',
  'react',
  'angular',
  'spring-boot',
  'system-design',
  'api-design',
  'software-architecture',
  'html',
  'css',
  'sql',
  'postgresql-dba',
  'mongodb',
  'design-system'
];

const BATCH_LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A to Z

// Define the maximum number of parallel tasks
const MAX_CONCURRENCY = 10;

async function runAll() {
    console.log("🌟 Starting Full Automation Orchestrator with Multi-Key Failover");
    console.log(`🚀 Concurrency Limit: ${MAX_CONCURRENCY} parallel batches`);
    
    // Generate all possible combinations of (PathSlug, BatchLetter)
    const queue = [];
    for (const slug of PATH_SLUGS) {
        for (const letter of BATCH_LETTERS) {
            queue.push({ slug, letter });
        }
    }

    let activeCount = 0;
    let completedPaths = new Set();
    
    // Process the queue with controlled concurrency
    const nextTask = async () => {
        if (queue.length === 0) return;
        
        const task = queue.shift();
        
        // If we already hit a missing batch for this path (e.g., path only has A-D, so E failed),
        // we skip processing the rest of the letters for this path to save time.
        if (completedPaths.has(task.slug)) {
            await nextTask();
            return;
        }

        activeCount++;
        try {
            const success = await runBatch(task.letter, task.slug);
            if (!success) {
                // Not found in markdown. This means this path has no more batches.
                completedPaths.add(task.slug);
            }
        } catch (e) {
            console.error(`💥 Fatal error for ${task.slug} Batch ${task.letter}`, e);
        } finally {
            activeCount--;
            // Recursively start the next task in the queue
            await nextTask();
        }
    };

    // Bootstrap initial concurrent workers
    const workers = [];
    for (let i = 0; i < MAX_CONCURRENCY && queue.length > 0; i++) {
        workers.push(nextTask());
    }

    // Wait for all workers to finish
    await Promise.all(workers);
    
    console.log("🎉 ALL CONTENT GENERATION COMPLETE!");
}

runAll().catch(console.error);
