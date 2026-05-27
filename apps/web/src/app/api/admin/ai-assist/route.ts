import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { topicSlug, topicTitle, level, sectionType, pathSlug } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are a senior developer writing educational MDX content for DevMastery, a programming learning platform. Write depth-first, complete explanations suitable for level ${level} developers. Always include code examples. Never skip explanation. Use pure MDX format. No preamble.`;
    let userPrompt = `Write the ${sectionType} section for a DevMastery topic about '${topicTitle}'.\nLevel ${level} (1=beginner, 5=expert). Follow the 6-layer teaching model. Include code examples. Format as MDX.`;

    if (sectionType === 'why') {
      userPrompt = `TASK: Write the WHY section for DevMastery topic: "${topicTitle}"\nPath: ${pathSlug} | Level: ${level}\n\nThe WHY section must answer:\n1. What problem existed BEFORE this concept was invented?\n2. What was painful about the old approach? Give a real code example of the pain.\n3. How does this concept solve that exact pain? Show the before vs after.\n4. Why do developers need to understand this deeply (not just use it)?\n\nMinimum 300 words. MDX format.`;
    } else if (sectionType === 'theory') {
      userPrompt = `TASK: Write the THEORY section for DevMastery topic: "${topicTitle}"\nPath: ${pathSlug} | Level: ${level}\n\nTHE THEORY SECTION IS THE HEART OF THE TOPIC. It must cover ALL of:\n- Complete internal mechanics — how does it work inside the JVM/browser/engine?\n- Data structure / memory layout (draw with ASCII art if helpful)\n- Step-by-step walkthrough of the most important operation\n- Every important edge case and what happens internally\n- Time complexity: derive it, don't just state it\n- Space complexity: derive it, count every allocation\n- Comparison with alternatives (when is X better than Y?)\n- Common misconceptions — what do beginners get wrong?\n\nMinimum 600 words. MDX format. Include ASCII diagrams where helpful.`;
    } else if (sectionType === 'code') {
      userPrompt = `TASK: Write the CODE section for DevMastery topic: "${topicTitle}"\nPath: ${pathSlug} | Level: ${level}\nPrimary Language: Java (or appropriate for path)\n\nGenerate code examples for ALL 5 levels.\nLabel each block clearly (e.g. ### Level 1 — Beginner).\nUse markdown code blocks.\nInclude main method / expected output.`;
    } else if (sectionType === 'realworld') {
      userPrompt = `TASK: Write the REAL WORLD section for DevMastery topic: "${topicTitle}"\nPath: ${pathSlug} | Level: ${level}\n\nStructure:\n1. "You've already used this" — show how the developer has unknowingly used this concept.\n2. Framework/Library usage — name EXACT classes.\n3. Production code snippet — show a real world usage.\n4. When NOT to use this — production anti-patterns.\n5. Performance data — give real numbers.\n\nMinimum 400 words.`;
    } else if (sectionType === 'interview') {
      userPrompt = `TASK: Write the INTERVIEW section for DevMastery topic: "${topicTitle}"\nPath: ${pathSlug} | Level: ${level}\n\nGenerate a complete interview prep section with 5 questions minimum (Conceptual, Coding, Tricky, Comparison, Scenario).\nFormat for each:\n### Q1: [Question]\n**Difficulty:** Medium | **Companies:** [Companies]\n\n❌ **Weak answer:** [...]\n✅ **Strong answer:** [...]\n**Follow-up:** [...]\n**Strong follow-up answer:** [...]`;
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: systemPrompt,
    });
    
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error('Error generating AI content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
