---
title: Implement Multi-Factor Authentication
impact: CRITICAL
impactDescription: Prevents account compromise even if passwords are stolen
tags: mfa, 2fa, totp, authentication
---

## Implement Multi-Factor Authentication

**Impact: CRITICAL (Prevents account compromise even if passwords are stolen)**

Implement MFA using TOTP (Time-based One-Time Password) or other secure methods. Never rely solely on passwords for sensitive operations.

**Incorrect (No MFA):**

```typescript
// ❌ BAD: No MFA - only password
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticate(email, password);
  const token = jwt.sign({ userId: user.id }, secret);
  res.json({ token });
});
```

**Correct (Implement MFA with TOTP):**

```typescript
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// ✅ Setup TOTP
async function setupMFA(userId: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(userId, 'MyApp', secret);
  const qrCode = await QRCode.toDataURL(otpauth);
  
  await db.users.update(userId, { mfaSecret: encrypt(secret) });
  
  return { qrCode, secret };
}

// ✅ Verify TOTP
function verifyMFA(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}

// ✅ Login with MFA
app.post('/login', async (req, res) => {
  const { email, password, totp } = req.body;
  const user = await authenticate(email, password);
  
  if (user.mfaEnabled) {
    if (!verifyMFA(totp, decrypt(user.mfaSecret))) {
      return res.status(401).json({ error: 'Invalid TOTP' });
    }
  }
  
  const token = jwt.sign({ userId: user.id }, secret);
  res.json({ token });
});
```

Reference: [OWASP A07: Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/)
