import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Use process.env for credentials (requires node --env-file=.env.local)
const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const STORIES_PATH = path.join(PROJECT_ROOT, 'assets/others/rizzze-40-complete-unique-stories.md');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'assets/audio/narration');

const ELEVENLABS_ENDPOINT = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

async function generateNarrations(options = {}) {
  const { isDryRun = true, limit = Infinity, model = 'eleven_multilingual_v2', targetStory = null } = options;
  
  console.log(`Starting ${isDryRun ? (isDryRun === 'test' ? 'TEST' : 'DRY RUN') : 'PRODUCTION'} generation...`);
  console.log(`Using Model: ${model}`);
  if (limit < Infinity) console.log(`Limit: ${limit} per category`);
  if (targetStory) console.log(`Target Story: ${targetStory}`);

  let totalChars = 0;
  const COST_PER_1K_CHARS = 0.30; 

  if (!fs.existsSync(STORIES_PATH)) {
    console.error('Stories file not found!');
    return;
  }

  const content = fs.readFileSync(STORIES_PATH, 'utf-8');
  const categories = content.split('## CATEGORY').filter(c => c.trim().length > 0);

  for (const catContent of categories) {
    const lines = catContent.split('\n');
    const categoryHeader = lines[0].match(/\d+: (.*)/);
    if (!categoryHeader) continue;

    const categoryName = categoryHeader[1].trim().toLowerCase().replace(/\s+/g, '-');
    const categoryDir = path.join(OUTPUT_DIR, categoryName);

    const stories = catContent.split('### ').filter(s => s.trim().length > 0 && /^\d+\./.test(s));
    
    let processedInCategory = 0;

    for (const storyRaw of stories) {
      if (processedInCategory >= limit) break;
      
      const storyLines = storyRaw.split('\n');
      const titleMatch = storyLines[0].match(/(\d+)\. (.*)/);
      if (!titleMatch) continue;

      const number = titleMatch[1].padStart(2, '0');
      const title = titleMatch[2].trim();

      // If targeting a specific story, skip others
      if (targetStory && number !== targetStory.padStart(2, '0')) continue;

      const filename = `${number}-${title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}.mp3`;
      const filePath = path.join(categoryDir, filename);

      const storyBody = storyRaw
        .split('\n')
        .slice(2)
        .filter(l => !l.startsWith('**') && !l.startsWith('---'))
        .join('\n')
        .trim();

      const finalBody = `${title}.\n\n${storyBody}`;
      totalChars += finalBody.length;
      processedInCategory++;

      console.log(`[${categoryName}] Story ${number}: ${title} (${finalBody.length} chars)`);

      if (isDryRun === true) {
        console.log(`   -> Would save to: ${filePath}`);
        continue;
      }

      if (fs.existsSync(filePath) && isDryRun !== 'test') {
        console.log(`   -> Skipping (already exists)`);
        continue;
      }

      console.log(`   -> Calling ElevenLabs API...`);
      const response = await fetch(ELEVENLABS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY,
        },
        body: JSON.stringify({
          text: finalBody,
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: 0.9,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error(`   -> Error: ${response.status}`, err);
        return; 
      }

      const audioBuffer = await response.arrayBuffer();
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
      fs.writeFileSync(filePath, Buffer.from(audioBuffer));
      console.log(`   -> Saved successfully: ${filePath}`);

      if (isDryRun === 'test') {
        console.log('\n--- SINGLE TEST COMPLETE ---');
        console.log(`Characters used: ${finalBody.length}`);
        console.log(`Estimated cost: $${((finalBody.length / 1000) * COST_PER_1K_CHARS).toFixed(3)}`);
        process.exit(0); 
      }
    }
  }

  console.log('\n--- BATCH SUMMARY ---');
  console.log(`Total Characters: ${totalChars}`);
  console.log(`Estimated Cost: ~$${((totalChars / 1000) * COST_PER_1K_CHARS).toFixed(2)} USD (for extra chars)`);
}

// Check flags
const args = process.argv.slice(2);
let limitIdx = args.indexOf('--limit');
let limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

let modelIdx = args.indexOf('--model');
let model = modelIdx !== -1 ? args[modelIdx + 1] : 'eleven_multilingual_v2';

let storyIdx = args.indexOf('--story');
let targetStory = storyIdx !== -1 ? args[storyIdx + 1] : null;

let mode;
if (args.includes('--run')) {
  mode = false;
} else if (args.includes('--test')) {
  mode = 'test';
} else {
  mode = true;
}

generateNarrations({ isDryRun: mode, limit, model, targetStory }).catch(console.error);
