---
title: Scan and Update Dependencies
impact: HIGH
impactDescription: Prevents exploitation of known vulnerabilities
tags: dependencies, npm-audit, snyk, security
---

## Scan and Update Dependencies

**Impact: HIGH (Prevents exploitation of known vulnerabilities)**

Regularly scan dependencies for vulnerabilities and keep them updated. Use automated tools to detect and fix security issues.

**Incorrect (No dependency management):**

```bash
# ❌ BAD: Never checking for vulnerabilities
npm install
npm start

# ❌ BAD: Ignoring audit warnings
npm audit
# 15 vulnerabilities found - ignored
```

**Correct (Regular scanning and updates):**

```bash
# ✅ Check for vulnerabilities
npm audit
npm audit fix

# ✅ Use Snyk for deeper scanning
npx snyk test
npx snyk monitor

# ✅ Keep dependencies updated
npx npm-check-updates -u
```

```json
// package.json - Use exact versions or ranges
{
  "dependencies": {
    "express": "^4.18.0",  // Minor updates OK
    "lodash": "4.17.21"    // Exact version
  },
  "overrides": {
    "vulnerable-package": "^2.0.0"  // Force safe version
  }
}
```

Reference: [OWASP A06: Vulnerable Components](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/)
