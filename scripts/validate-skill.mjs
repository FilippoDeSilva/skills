import fs from 'fs';
import path from 'path';

const skillPath = process.argv[2];
if (!skillPath) {
  console.error('❌ Missing skill path argument');
  process.exit(1);
}

const skillFile = path.join(skillPath, 'SKILL.md');
if (!fs.existsSync(skillFile)) {
  console.error('❌ Missing SKILL.md');
  process.exit(1);
}

const content = fs.readFileSync(skillFile, 'utf8');

// extract YAML frontmatter (handle potential BOM)
const match = content.replace(/^﻿/, '').match(/^---([\s\S]*?)---/);

if (!match) {
  console.error('❌ Missing frontmatter');
  process.exit(1);
}

const yaml = match[1];

// minimal YAML parser (safe subset)
const parseYaml = (str) => {
  const obj = {};
  const lines = str.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const [key, ...rest] = line.split(":");
    if (!key || !rest.length) continue;

    const k = key.trim();
    let v = rest.join(":").trim();

    // Handle multiline lists (tags:)
    if (k === "tags" && v === "") {
      const tags = [];
      let j = i + 1;
      while (j < lines.length && lines[j].match(/^\s+-\s+/)) {
        const tag = lines[j].replace(/^\s+-\s+/, "").trim();
        if (tag) tags.push(tag);
        j++;
      }
      obj[k] = tags;
      i = j - 1;
      continue;
    }

    // Handle inline arrays: [a, b, c]
    if (v.startsWith("[")) {
      obj[k] = v
        .replace(/[\[\]]/g, "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else {
      obj[k] = v.replace(/['"]/g, "");
    }
  }
  return obj;
};

const meta = parseYaml(yaml);

if (!meta.name) {
  console.error('❌ Missing name');
  process.exit(1);
}

const skillName = path.basename(skillPath);
if (meta.name !== skillName) {
  console.error(`❌ name mismatch: ${meta.name} != ${skillName}`);
  process.exit(1);
}

if (!meta.version || !meta.version.match(/^\d+\.\d+\.\d+$/)) {
  console.error('❌ invalid version');
  process.exit(1);
}

if (meta.tags) {
  for (const tag of meta.tags) {
    if (!tag.match(/^[a-z0-9-]+$/)) {
      console.error(`❌ Invalid tag: ${tag}`);
      process.exit(1);
    }
  }
}

console.log('✓ schema valid');
