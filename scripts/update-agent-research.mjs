// Build-time export of trusted repository content; never run on visitor input.
import fs from 'node:fs';
import ts from 'typescript';
const root = new URL('../', import.meta.url);
const source = fs.readFileSync(new URL('lib/research-data.ts', root), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
new Function('exports', 'module', js)(mod.exports, mod);
const data = mod.exports.researchProjects.map(p => ({
  id: p.id, title: p.title, description: p.fullDescription, technologies: p.technologies,
  url: `https://www.ythsieh.dev/research/${p.id}`,
  publications: p.publications?.map(({ title, url, publication, year }) => ({ title, url, publication, year })),
  references: p.references,
}));
fs.writeFileSync(new URL('worker/src/research.json', root), JSON.stringify(data, null, 2) + '\n');
console.log(`Exported ${data.length} research projects`);
