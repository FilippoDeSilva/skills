import fs from "fs";
import path from "path";
import Ajv from "ajv";

const ajv = new Ajv();
const schema = JSON.parse(
  fs.readFileSync(new URL("./schema/skill.schema.json", import.meta.url))
);

const validate = ajv.compile(schema);

const skillsDir = path.resolve("skills");
const outputDir = path.resolve("dist");
const outputFile = path.join(outputDir, "skills.index.json");

if (!fs.existsSync(skillsDir)) {
  console.log("No skills directory found.");
  process.exit(0);
}

const skillFolders = fs
  .readdirSync(skillsDir)
  .filter((f) => fs.statSync(path.join(skillsDir, f)).isDirectory());

const catalog = [];

for (const folder of skillFolders) {
  const filePath = path.join(skillsDir, folder, "SKILL.md");

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing SKILL.md in ${folder}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");

  // extract YAML frontmatter (handle potential BOM)
  const match = content.replace(/^﻿/, '').match(/^---([\s\S]*?)---/);

  if (!match) {
    console.error(`❌ Missing frontmatter in ${folder}`);
    process.exit(1);
  }

  const yaml = match[1];

  // minimal YAML parser (safe subset)
  const parseYaml = (str) => {
    const obj = {};
    str.split("\n").forEach((line) => {
      const [key, ...rest] = line.split(":");
      if (!key || !rest.length) return;
      obj[key.trim()] = rest.join(":").trim();
    });
    return obj;
  };

  const meta = parseYaml(yaml);

  meta.name = meta.name?.replace(/['"]/g, "");
  meta.version = meta.version?.replace(/['"]/g, "");
  meta.author = meta.author?.replace(/['"]/g, "");

  // parse tags safely
  if (typeof meta.tags === "string") {
    meta.tags = meta.tags
      .replace(/[\[\]]/g, "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  // validate schema
  const valid = validate(meta);

  if (!valid) {
    console.error(`❌ Schema error in ${folder}:`);
    console.error(validate.errors);
    process.exit(1);
  }

  // folder-name rule
  if (meta.name !== folder) {
    console.error(`❌ name mismatch: ${meta.name} != ${folder}`);
    process.exit(1);
  }

  catalog.push({
    ...meta,
    path: `skills/${folder}`
  });
}

// ensure dist
fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(outputFile, JSON.stringify(catalog, null, 2));

console.log(`✅ Catalog generated: ${outputFile}`);