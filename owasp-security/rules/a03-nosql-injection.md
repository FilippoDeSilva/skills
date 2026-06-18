---
title: Prevent NoSQL Injection
impact: CRITICAL
impactDescription: Prevents attackers from executing malicious NoSQL queries
tags: nosql-injection, input-validation, mongodb, validation
---

## Prevent NoSQL Injection

**Impact: CRITICAL (Prevents attackers from executing malicious NoSQL queries)**

NoSQL databases like MongoDB are vulnerable to injection attacks when user input is directly used in queries without validation.

**Incorrect (Direct user input in query):**

```typescript
// ❌ BAD: Direct user input in query
const user = await User.findOne({ username: req.body.username });
// Attack: { "username": { "$gt": "" } } returns first user

// ❌ BAD: Unvalidated query operators
const query = JSON.parse(req.body.query);
const results = await User.find(query);
```

**Correct (Validate input type and sanitize):**

```typescript
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
});

app.post('/login', async (req, res) => {
  const { username, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ username: String(username) });
  // ...
});

// ✅ GOOD: Use whitelist for allowed fields
const allowedFields = ['username', 'email', 'role'];
const query = {};
for (const key of Object.keys(req.body)) {
  if (allowedFields.includes(key)) {
    query[key] = req.body[key];
  }
}
const results = await User.find(query);
```

Reference: [OWASP A03: Injection](https://owasp.org/Top10/A03_2021-Injection/)
