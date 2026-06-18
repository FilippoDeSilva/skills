---
title: Use Secure Headers
impact: HIGH
impactDescription: Protects against various web vulnerabilities
tags: headers, helmet, csp, hsts, security
---

## Use Secure Headers

**Impact: HIGH (Protects against various web vulnerabilities)**

Implement security headers to protect against XSS, clickjacking, and other web vulnerabilities.

**Incorrect (Missing security headers):**

```typescript
// ❌ BAD: No security headers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

**Correct (Use helmet for security headers):**

```typescript
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'strict-dynamic'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
  },
}));
```

Reference: [OWASP A02: Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)
