---
title: Implement Secure Password Reset
impact: CRITICAL
impactDescription: Prevents account takeover through password reset vulnerabilities
tags: password-reset, authentication, tokens, security
---

## Implement Secure Password Reset

**Impact: CRITICAL (Prevents account takeover through password reset vulnerabilities)**

Use secure, time-limited tokens for password resets. Never reveal whether an email exists in the system.

**Incorrect (Insecure password reset):**

```typescript
// ❌ BAD: Predictable tokens
const token = userId + '-' + Date.now();

// ❌ BAD: Long expiry or no expiry
const token = crypto.randomBytes(16).toString('hex');
await db.passwordResets.create({
  userId,
  token,
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year!
});

// ❌ BAD: Reveal if email exists
app.post('/reset-request', async (req, res) => {
  const user = await db.users.findByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Email not found' });
  }
  // ...
});
```

**Correct (Secure password reset):**

```typescript
import crypto from 'crypto';

// ✅ Secure password reset
async function initiatePasswordReset(email: string) {
  const user = await db.users.findByEmail(email);
  if (!user) return; // Don't reveal if email exists
  
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  await db.passwordResets.create({
    userId: user.id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });
  
  await sendEmail(email, `Reset link: /reset?token=${token}`);
}

// ✅ Verify token properly
async function resetPassword(token: string, newPassword: string) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const reset = await db.passwordResets.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
  });
  
  if (!reset) {
    throw new Error('Invalid or expired token');
  }
  
  const hashedPassword = await hashPassword(newPassword);
  await db.users.update(reset.userId, { password: hashedPassword });
  await db.passwordResets.delete({ id: reset.id });
}
```

Reference: [OWASP A07: Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/)
