---
title: Prevent Command Injection
impact: CRITICAL
impactDescription: Prevents attackers from executing arbitrary system commands
tags: command-injection, exec, validation, sanitization
---

## Prevent Command Injection

**Impact: CRITICAL (Prevents attackers from executing arbitrary system commands)**

Never execute shell commands with user input directly. Use safe alternatives or validate and sanitize input thoroughly.

**Incorrect (Shell injection):**

```typescript
// ❌ BAD: Shell injection
import { exec } from 'child_process';
exec(`convert ${userInput} output.png`);  // userInput: "; rm -rf /"

// ❌ BAD: Template literals with user input
exec(`curl ${url}`);
```

**Correct (Use execFile with array args):**

```typescript
import { execFile } from 'child_process';

// ✅ GOOD: Use execFile with array args
execFile('convert', [userInput, 'output.png'], (error, stdout) => {
  // Safe - arguments are not shell-interpreted
});

// ✅ GOOD: Validate and sanitize
const allowedFormats = ['png', 'jpg', 'gif'];
if (!allowedFormats.includes(format)) {
  throw new Error('Invalid format');
}

// ✅ GOOD: Use allowlist for commands
const allowedCommands = ['convert', 'resize'];
if (!allowedCommands.includes(command)) {
  throw new Error('Invalid command');
}
```

Reference: [OWASP A03: Injection](https://owasp.org/Top10/A03_2021-Injection/)
