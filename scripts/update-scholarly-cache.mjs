import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

const execFileAsync = promisify(execFile);
const authorId = process.env.SCHOLAR_AUTHOR_ID || 'TSoiF94AAAAJ';
const pythonCmd = process.env.SCHOLARLY_PYTHON_PATH || 'python3';
const scriptPath = path.join(process.cwd(), 'scripts', 'fetch-scholarly-citations.py');
const outputPath = path.join(process.cwd(), 'data', 'scholar-stats.json');

async function main() {
  const { stdout } = await execFileAsync(pythonCmd, [scriptPath, authorId], {
    cwd: process.cwd(),
    timeout: 60000,
    maxBuffer: 1024 * 1024,
  });

  const parsed = JSON.parse(stdout);
  await writeFile(outputPath, JSON.stringify(parsed, null, 2), 'utf8');
  console.log(`Updated ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
