---
title: Implement Rate Limiting
impact: HIGH
impactDescription: Prevents brute force attacks and abuse
tags: rate-limiting, ddos, brute-force, express-rate-limit
---

## Implement Rate Limiting

**Impact: HIGH (Prevents brute force attacks and abuse)**

Implement rate limiting to prevent brute force attacks, DDoS, and API abuse. Use stricter limits for sensitive endpoints like authentication.

**Incorrect (No rate limiting):**

```typescript
// ❌ BAD: No rate limiting
app.post('/api/login', loginHandler);
app.get('/api/data', dataHandler);
```

**Correct (Implement rate limiting):**

```typescript
import rateLimit from 'express-rate-limit';

// General rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 failed attempts
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
```

Reference: [OWASP A04: Insecure Design](https://owasp.org/Top10/A04_2021-Insecure_Design/)
