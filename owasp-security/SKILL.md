---
name: owasp-security
description: Implement secure coding practices following OWASP Top 10. Use when preventing security vulnerabilities, implementing authentication, securing APIs, or conducting security reviews. Triggers on OWASP, security, XSS, SQL injection, CSRF, authentication security, secure coding, vulnerability.
license: MIT
metadata:
  version: "1.0.0"
  author: FilippoDeSilva
---

# OWASP Security Best Practices

This skill provides guidance for implementing secure coding practices based on the OWASP Top 10 (2021). Use this when implementing authentication, securing APIs, preventing injection attacks, or conducting security reviews.

## When to Use This Skill

Activate this skill when:
- Implementing authentication or authorization
- Handling user input or form data
- Working with databases or queries
- Implementing session management
- Configuring security headers
- Reviewing code for security vulnerabilities
- User mentions OWASP, security, XSS, SQL injection, CSRF, or vulnerabilities

## Key Security Principles

### A01: Broken Access Control
- Always verify user permissions before allowing actions
- Implement role-based access control (RBAC)
- Prevent Insecure Direct Object References (IDOR) by checking resource ownership
- Use UUIDs instead of sequential IDs for sensitive resources

### A02: Cryptographic Failures
- Hash passwords using bcrypt with cost ≥ 12
- Use strong encryption algorithms (AES-256-GCM) for sensitive data
- Never store secrets in plain text
- Use secure random number generation for tokens
- Implement secure headers (helmet, HSTS, CSP)

### A03: Injection
- Use parameterized queries for SQL
- Validate and sanitize all user input
- Use ORM methods instead of raw queries
- Prevent command injection by using execFile with array arguments
- Validate NoSQL queries against allowlists

### A04: Insecure Design
- Implement rate limiting on sensitive endpoints
- Validate all input using schemas (Zod, Joi)
- Design security in from the start (threat modeling)
- Use allowlists instead of blocklists

### A05: Security Misconfiguration
- Never expose stack traces in production
- Disable debug modes in production
- Use secure cookie configuration (httpOnly, secure, sameSite)
- Remove default credentials
- Keep dependencies updated

### A06: Vulnerable Components
- Regularly run `npm audit` and fix vulnerabilities
- Use dependency scanning tools (Snyk)
- Keep dependencies updated
- Use exact versions or safe ranges

### A07: Authentication Failures
- Use short-lived JWT tokens with refresh tokens
- Implement secure password reset flows
- Add multi-factor authentication (MFA)
- Use secure session management
- Never reveal if an email exists in password reset

### A08: Data Integrity Failures
- Prevent XSS by auto-escaping output
- Use Content Security Policy (CSP)
- Sanitize HTML if using dangerouslySetInnerHTML
- Validate all input

### A09: Logging Failures
- Log security events (failed logins, access denials)
- Use structured logging (JSON format)
- Implement audit trails
- Set up alerts for suspicious activity

### A10: SSRF
- Validate URLs against allowlists
- Block private IP ranges (localhost, 10.x, 172.x, 192.168.x)
- Never use user input directly in fetch requests
- Use DNS rebinding protection

## Common Security Patterns

### Password Hashing
```typescript
import bcrypt from 'bcrypt';

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12); // Use cost ≥ 12
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### Input Validation
```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

const data = userSchema.parse(req.body);
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts
});

app.use('/api/auth/', authLimiter);
```

### Secure Headers
```typescript
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000 }));
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
  },
}));
```

## Pre-Deployment Checklist

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
- [ ] Error monitoring enabled

## References

- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [Snyk](https://snyk.io/)
