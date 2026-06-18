---
title: Validate All Input
impact: HIGH
impactDescription: Prevents injection attacks and data corruption
tags: input-validation, zod, joi, validation
---

## Validate All Input

**Impact: HIGH (Prevents injection attacks and data corruption)**

Always validate and sanitize all user input using a validation library like Zod or Joi. Never trust client-side validation.

**Incorrect (No validation or weak validation):**

```typescript
// ❌ BAD: No validation
app.post('/api/users', async (req, res) => {
  const { email, password, age } = req.body;
  await db.users.create({ email, password, age });
});

// ❌ BAD: Weak validation
if (email && password && age) {
  await db.users.create({ email, password, age });
}
```

**Correct (Use strong validation schema):**

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  age: z.number().int().min(13).max(120),
  role: z.enum(['user', 'admin']).default('user'),
});

app.post('/api/users', async (req, res) => {
  try {
    const data = userSchema.parse(req.body);
    // Validated data is safe to use
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    throw error;
  }
});
```

Reference: [OWASP A04: Insecure Design](https://owasp.org/Top10/A04_2021-Insecure_Design/)
