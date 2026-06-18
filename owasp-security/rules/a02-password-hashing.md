---
title: Hash Passwords Securely
impact: CRITICAL
impactDescription: Prevents password exposure in case of data breach
tags: password, hashing, bcrypt, encryption
---

## Hash Passwords Securely

**Impact: CRITICAL (Prevents password exposure in case of data breach)**

Never store passwords in plain text. Always use strong hashing algorithms like bcrypt with appropriate cost factors.

**Incorrect (Plain text or weak hashing):**

```typescript
// ❌ BAD: Plain text storage
const user = await db.users.create({
  email,
  password: req.body.password,  // Stored in plain text!
});

// ❌ BAD: Weak hashing (MD5, SHA1)
const hash = crypto.createHash('md5').update(password).digest('hex');
```

**Correct (Use bcrypt with appropriate cost):**

```typescript
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// ✅ Hash passwords with bcrypt
const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ✅ Secure token generation
function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
```

Reference: [OWASP A02: Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)
