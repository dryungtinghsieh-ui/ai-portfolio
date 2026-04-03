import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

const execFileAsync = promisify(execFile);
const authorId = process.env.SCHOLAR_AUTHOR_ID || 'TSoiF94AAAAJ';
const scriptPath = path.join(process.cwd(), 'scripts', 'fetch-scholarly-citations.py');
const outputPath = path.join(process.cwd(), 'data', 'scholar-stats.json');

function normalizeCitationPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (
    typeof payload.totalCitations !== 'number' ||
    !Number.isFinite(payload.totalCitations) ||
    typeof payload.citationsByScholarId !== 'object' ||
    payload.citationsByScholarId === null
  ) {
    return null;
  }

  return payload;
}

async function main() {
  const pythonCommands = process.env.SCHOLARLY_PYTHON_PATH
    ? [process.env.SCHOLARLY_PYTHON_PATH]
    : ['python3', 'python'];
  let parsed = null;
  let lastError = null;

  for (const pythonCommand of pythonCommands) {
    try {
      const { stdout } = await execFileAsync(pythonCommand, [scriptPath, authorId], {
        cwd: process.cwd(),
        timeout: 60000,
        maxBuffer: 1024 * 1024,
      });

      parsed = normalizeCitationPayload(JSON.parse(stdout));
      if (!parsed) {
        throw new Error('Invalid scholarly payload');
      }
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!parsed) {
    throw lastError ?? new Error('Unable to generate scholarly cache');
  }

  await writeFile(outputPath, JSON.stringify(parsed, null, 2), 'utf8');
  console.log(`Updated ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
