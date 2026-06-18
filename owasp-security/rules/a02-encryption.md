---
title: Encrypt Sensitive Data
impact: CRITICAL
impactDescription: Protects sensitive data at rest and in transit
tags: encryption, aes, crypto, sensitive-data
---

## Encrypt Sensitive Data

**Impact: CRITICAL (Protects sensitive data at rest and in transit)**

Encrypt sensitive data like PII, secrets, and configuration values using strong encryption algorithms with proper key management.

**Incorrect (No encryption or weak encryption):**

```typescript
// ❌ BAD: Storing sensitive data in plain text
const user = await db.users.create({
  email,
  ssn: req.body.ssn,  // Plain text SSN!
  creditCard: req.body.card,
});

// ❌ BAD: Using weak encryption or hardcoded keys
const encrypted = simpleEncrypt(data, 'my-secret-key');
```

**Correct (Use strong encryption with proper key management):**

```typescript
import crypto from 'crypto';

// ✅ Encrypt sensitive data
const ALGORITHM = 'aes-256-gcm';
const KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);

function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
  };
}

function decrypt(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage
const encrypted = encrypt(user.ssn);
await db.users.create({
  email,
  ssnEncrypted: encrypted.encrypted,
  ssnIv: encrypted.iv,
  ssnTag: encrypted.tag,
});
```

Reference: [OWASP A02: Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)
