---
title: Implement Secure Session Management
impact: CRITICAL
impactDescription: Prevents session hijacking and unauthorized access
tags: session, jwt, authentication, cookies
---

## Implement Secure Session Management

**Impact: CRITICAL (Prevents session hijacking and unauthorized access)**

Use short-lived tokens with refresh tokens, secure cookie configuration, and proper session invalidation.

**Incorrect (Long-lived tokens or insecure cookies):**

```typescript
// ❌ BAD: Long-lived tokens
const token = jwt.sign({ userId }, secret, { expiresIn: '365d' });

// ❌ BAD: Insecure cookie configuration
app.use(session({
  secret: 'secret',
  cookie: {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
  },
}));
```

**Correct (Secure session management):**

```typescript
import jwt from 'jsonwebtoken';

// ✅ JWT with short expiry + refresh tokens
function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }  // Short-lived
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

// ✅ Secure cookie configuration
app.use(session({
  secret: process.env.SESSION_SECRET!,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  resave: false,
  saveUninitialized: false,
}));
```

Reference: [OWASP A07: Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/)
