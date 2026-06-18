# OWASP Security Best Practices

A structured repository for OWASP Top 10 security best practices optimized for agents and LLMs.

## Installation

Install this skill using [skills](https://github.com/vercel-labs/skills):

```bash
# Install locally
npx skills add <your-repo>/owasp-security

# Install globally (available across all projects)
npx skills add <your-repo>/owasp-security --global

# Install for specific agents
npx skills add <your-repo>/owasp-security -a claude-code -a cursor
```

### Supported Agents

- Claude Code
- OpenCode
- Codex
- Cursor
- Antigravity
- Roo Code

## Structure

- `rules/` - Individual rule files (one per rule)
  - `_sections.md` - Section metadata (titles, impacts, descriptions)
  - `_template.md` - Template for creating new rules
  - `a01-*.md` - Broken Access Control rules
  - `a02-*.md` - Cryptographic Failures rules
  - `a03-*.md` - Injection rules
  - `a04-*.md` - Insecure Design rules
  - `a05-*.md` - Security Misconfiguration rules
  - `a06-*.md` - Vulnerable Components rules
  - `a07-*.md` - Authentication Failures rules
  - `a08-*.md` - Data Integrity Failures rules
  - `a09-*.md` - Logging Failures rules
  - `a10-*.md` - SSRF rules
  - `xss-*.md` - XSS Prevention rules
  - `checklist-*.md` - Security checklist rules
- `scripts/` - Build scripts and utilities
- `metadata.json` - Document metadata (version, organization, abstract)
- __`AGENTS.md`__ - Compiled output (generated)

## Getting Started

1. Install dependencies:
   ```bash
   cd scripts && npm install
   ```

2. Build AGENTS.md from rules:
   ```bash
   npm run build
   # or
   npx ts-node scripts/build-agents.ts
   ```

## Creating a New Rule

1. Copy `rules/_template.md` to `rules/area-description.md`
2. Choose the appropriate area prefix:
   - `a01-` for Broken Access Control (Section 1)
   - `a02-` for Cryptographic Failures (Section 2)
   - `a03-` for Injection (Section 3)
   - `a04-` for Insecure Design (Section 4)
   - `a05-` for Security Misconfiguration (Section 5)
   - `a06-` for Vulnerable Components (Section 6)
   - `a07-` for Authentication Failures (Section 7)
   - `a08-` for Data Integrity Failures (Section 8)
   - `a09-` for Logging Failures (Section 9)
   - `a10-` for SSRF (Section 10)
   - `xss-` for XSS Prevention (Section 11)
   - `checklist-` for Security Checklist (Section 12)
3. Fill in the frontmatter and content
4. Ensure you have clear examples with explanations
5. Run the build script to regenerate AGENTS.md

## Rule File Structure

Each rule file should follow this structure:

```markdown
---
title: Rule Title Here
impact: MEDIUM
impactDescription: Optional description
tags: tag1, tag2, tag3
---

## Rule Title Here

Brief explanation of the rule and why it matters.

**Incorrect (description of what's wrong):**

```typescript
// Bad code example
```

**Correct (description of what's right):**

```typescript
// Good code example
```

Optional explanatory text after examples.

Reference: [OWASP Documentation](https://owasp.org/Top10/)
```

## File Naming Convention

- Files starting with `_` are special (excluded from build)
- Rule files: `area-description.md` (e.g., `a01-authorization-checks.md`)
- Section is automatically inferred from filename prefix
- Rules are sorted alphabetically by title within each section
- IDs (e.g., 1.1, 1.2) are auto-generated during build

## Impact Levels

| Level | Description |
|-------|-------------|
| CRITICAL | Violations cause security vulnerabilities or data breaches |
| HIGH | Significant impact on security posture |
| MEDIUM | Moderate impact on security best practices |
| LOW | Minor security improvements |

## Scripts

- `npm run build` (in scripts/) - Compile rules into AGENTS.md

## Contributing

When adding or modifying rules:

1. Use the correct filename prefix for your section
2. Follow the `_template.md` structure
3. Include clear bad/good examples with explanations
4. Add appropriate tags
5. Run the build script to regenerate AGENTS.md
6. Rules are automatically sorted by title - no need to manage numbers!

## Acknowledgments

- Inspired by the [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills) skill structure
- Compatible with [skills](https://github.com/vercel-labs/skills) for easy installation across coding agents
- Based on [OWASP Top 10](https://owasp.org/Top10/)

## Compatible Agents

These OWASP security skills work with:

- [Claude Code](https://claude.ai/code) - Anthropic's official CLI
- [AdaL](https://sylph.ai/adal) - Self-evolving AI coding agent with MCP support
