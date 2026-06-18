---
title: Secure Environment Configuration
impact: HIGH
impactDescription: Prevents information disclosure and misconfiguration vulnerabilities
tags: environment, config, security, production
---

## Secure Environment Configuration

**Impact: HIGH (Prevents information disclosure and misconfiguration vulnerabilities)**

Never expose sensitive information in production. Disable debug modes, stack traces, and unnecessary headers.

**Incorrect (Exposing sensitive information):**

```typescript
// ❌ BAD: Expose stack traces in production
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

// ❌ BAD: Expose server information
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Express/4.18.0');
  next();
});
```

**Correct (Secure configuration):**

```typescript
// ✅ Never expose stack traces in production
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log for debugging
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});

// ✅ Disable sensitive headers
app.disable('x-powered-by');

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

Reference: [OWASP A05: Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/)
