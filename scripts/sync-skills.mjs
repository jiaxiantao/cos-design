#!/usr/bin/env node
/**
 * Sync canonical Agent Skill to tool-specific skill directories.
 * Source: .agents/skills/cos-design/SKILL.md (Agent Skills open standard)
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE = join(ROOT, '.agents/skills/cos-design/SKILL.md');

const TARGETS = [
  '.cursor/skills/cos-design/SKILL.md',
  '.opencode/skills/cos-design/SKILL.md',
  '.trae/skills/cos-design/SKILL.md'
];

const skill = readFileSync(SOURCE, 'utf8');

for (const rel of TARGETS) {
  const dest = join(ROOT, rel);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, skill);
}

console.log(`Synced skill to ${TARGETS.length} tool directories from .agents/skills/cos-design`);
