---
name: owasp-security
description: Implement secure coding practices following OWASP Top 10. Use when preventing security vulnerabilities, implementing authentication, securing APIs, or conducting security reviews. Triggers on OWASP, security, XSS, SQL injection, CSRF, authentication security, secure coding, vulnerability.
version: 1.0.0
author: FilippoDeSilva
tags:
  - owasp
  - apisec
  - nestjs
---

# OWASP Top 10 Security

Prevent common security vulnerabilities in web applications.

## OWASP Top 10 (2021)

| # | Vulnerability | Prevention |
|---|---------------|------------|
| A01 | Broken Access Control | Proper authorization checks |
| A02 | Cryptographic Failures | Strong encryption, secure storage |
| A03 | Injection | Input validation, parameterized queries |
| A04 | Insecure Design | Threat modeling, secure patterns |
| A05 | Security Misconfiguration | Hardened configs, no defaults |
| A06 | Vulnerable Components | Dependency scanning, updates |
| A07 | Auth Failures | MFA, secure session management |
| A08 | Data Integrity Failures | Input validation, signed updates |
| A09 | Logging Failures | Comprehensive audit logs |
| A10 | SSRF | URL validation, allowlists |

## A01: Broken Access Control

### Prevention Patterns
```typescript
// ❌ BAD: No authorization check
app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  res.json(user);
});

// ✅ GOOD: Verify ownership
app.get('/api/users/:id', authenticate, async (req, res) => {
  const userId = req.params.id;
  
  // Users can only access their own data
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const user = await db.users.findById(userId);
  res.json(user);
});

// ✅ GOOD: Role-based access control (RBAC)
const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

app.delete('/api/posts/:id', authenticate, requireRole('admin', 'moderator'), deletePost);
```

### Insecure Direct Object Reference (IDOR)
```typescript
// ❌ BAD: Predictable IDs exposed
GET /api/invoices/1001
GET /api/invoices/1002  // Can enumerate others' invoices

// ✅ GOOD: Use UUIDs + ownership check
app.get('/api/invoices/:id', authenticate, async (req, res) => {
  const invoice = await db.invoices.findOne({
    id: req.params.id,
    userId: req.user.id,  // Enforce ownership
  });
  
  if (!invoice) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.json(invoice);
});
```

## A02: Cryptographic Failures

### Password Hashing
```typescript
import bcrypt from 'bcrypt';

// ❌ BAD: Plain text or weak hashing
const hash = md5(password);  // Never use MD5
const hash = sha1(password);  // Never use SHA1

// ✅ GOOD: bcrypt with cost ≥ 12
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### Secure Headers
```typescript
import helmet from 'helmet';

// ✅ GOOD: Security headers
app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000 }));
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
  },
}));
```

## A03: Injection

### SQL Injection Prevention
```typescript
// ❌ BAD: String concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;
const result = await db.query(query);

// ✅ GOOD: Parameterized queries
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// ✅ GOOD: ORM methods
const user = await User.findByPk(userId);
```

### NoSQL Injection Prevention
```typescript
// ❌ BAD: Direct object injection
const query = { username: req.body.username, password: req.body.password };
const user = await User.findOne(query);

// ✅ GOOD: Validate against schema
const schema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
});

const data = schema.parse(req.body);
const user = await User.findOne(data);
```

### Command Injection Prevention
```typescript
// ❌ BAD: Shell command with user input
const { exec } = require('child_process');
exec(`git log --author="${author}"`, callback);

// ✅ GOOD: Use execFile with array arguments
const { execFile } = require('child_process');
execFile('git', ['log', '--author', author], callback);
```

## A04: Insecure Design

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

// ✅ GOOD: Rate limiting on sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts
});

app.use('/api/auth/', authLimiter);
```

### Input Validation
```typescript
import { z } from 'zod';

// ✅ GOOD: Schema validation
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

const data = userSchema.parse(req.body);
```

## A05: Security Misconfiguration

### Environment Configuration
```typescript
// ❌ BAD: Hardcoded secrets
const apiKey = 'sk_live_1234567890abcdef';

// ✅ GOOD: Environment variables
const apiKey = process.env.API_KEY;

// ❌ BAD: Debug mode in production
app.use(express.json({ debug: true }));

// ✅ GOOD: Conditional debug
app.use(express.json({ debug: process.env.NODE_ENV !== 'production' }));
```

## A06: Vulnerable Components

### Dependency Scanning
```bash
# Regularly audit dependencies
npm audit
npm audit fix

# Use Snyk for continuous monitoring
npx snyk test
npx snyk monitor
```

## A07: Authentication Failures

### Secure Session Management
```typescript
// ✅ GOOD: Secure cookie configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));
```

### Multi-Factor Authentication
```typescript
// ✅ GOOD: Implement MFA for sensitive operations
const enableMFA = async (userId: string) => {
  const secret = speakeasy.generateSecret();
  await User.update(userId, { mfaSecret: secret.base32 });
  return secret.otpauth_url;
};

const verifyMFA = (token: string, secret: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
  });
};
```

## A08: XSS Prevention

### Content Security Policy
```typescript
// ✅ GOOD: CSP headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
}));
```

### Input Sanitization
```typescript
import DOMPurify from 'dompurify';

// ❌ BAD: Direct HTML rendering
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ GOOD: Sanitize HTML
const cleanContent = DOMPurify.sanitize(userContent);
<div dangerouslySetInnerHTML={{ __html: cleanContent }} />
```

## A09: Logging & Monitoring

### Security Event Logging
```typescript
// ✅ GOOD: Log security events
logger.info('User login', { userId, ip, timestamp });
logger.warn('Failed login attempt', { email, ip, reason });
logger.error('Access denied', { userId, resource, action });
```

## A10: SSRF Prevention

### URL Validation
```typescript
// ❌ BAD: Direct fetch with user input
const data = await fetch(userProvidedUrl);

// ✅ GOOD: Validate against allowlist
const ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com'];

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.includes(parsed.hostname);
  } catch {
    return false;
  }
};

if (isValidUrl(userProvidedUrl)) {
  const data = await fetch(userProvidedUrl);
}
```

## Security Checklist

Before deploying, verify:
- [ ] Passwords hashed with bcrypt (cost ≥ 12)
- [ ] JWT tokens have short expiry
- [ ] Session cookies are httpOnly, secure, sameSite
- [ ] Rate limiting on auth endpoints
- [ ] All endpoints have auth checks
- [ ] RBAC implemented correctly
- [ ] No IDOR vulnerabilities
- [ ] All input validated
- [ ] SQL queries parameterized
- [ ] XSS prevented (CSP, escaping)
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Dependencies audited
- [ ] Secrets in environment variables
- [ ] Security events logged

## Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
