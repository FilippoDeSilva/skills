# OWASP Security Best Practices

**Version 1.0.0**
OWASP Security Best Practices
2026-06-18

> **Note:**
> This document is mainly for agents and LLMs to follow when implementing,
> reviewing, or refactoring code for security vulnerabilities. It covers the
> OWASP Top 10 (2021) with practical code examples showing incorrect and
> correct implementations.

---

## Abstract

This document provides comprehensive security guidelines based on the OWASP Top 10 (2021). It covers prevention patterns for common web application vulnerabilities including broken access control, cryptographic failures, injection attacks, insecure design, security misconfiguration, vulnerable components, authentication failures, data integrity failures, logging failures, and SSRF. Each section includes code examples showing incorrect and correct implementations.

---

## Table of Contents

1. [Broken Access Control](#1-broken-access-control) — **CRITICAL**
   - 1.1 [Implement Authorization Checks](#11-implement-authorization-checks)
   - 1.2 [Prevent Insecure Direct Object Reference (IDOR)](#12-prevent-insecure-direct-object-reference-idor-)
2. [Cryptographic Failures](#2-cryptographic-failures) — **CRITICAL**
   - 2.1 [Encrypt Sensitive Data](#21-encrypt-sensitive-data)
   - 2.2 [Hash Passwords Securely](#22-hash-passwords-securely)
   - 2.3 [Use Secure Headers](#23-use-secure-headers)
3. [Injection](#3-injection) — **CRITICAL**
   - 3.1 [Prevent Command Injection](#31-prevent-command-injection)
   - 3.2 [Prevent NoSQL Injection](#32-prevent-nosql-injection)
   - 3.3 [Prevent SQL Injection](#33-prevent-sql-injection)
4. [Insecure Design](#4-insecure-design) — **HIGH**
   - 4.1 [Validate All Input](#41-validate-all-input)
   - 4.2 [Implement Rate Limiting](#42-implement-rate-limiting)
5. [Security Misconfiguration](#5-security-misconfiguration) — **HIGH**
   - 5.1 [Secure Environment Configuration](#51-secure-environment-configuration)
6. [Vulnerable Components](#6-vulnerable-components) — **HIGH**
   - 6.1 [Scan and Update Dependencies](#61-scan-and-update-dependencies)
7. [Authentication Failures](#7-authentication-failures) — **CRITICAL**
   - 7.1 [Implement Multi-Factor Authentication](#71-implement-multi-factor-authentication)
   - 7.2 [Implement Secure Password Reset](#72-implement-secure-password-reset)
   - 7.3 [Implement Secure Session Management](#73-implement-secure-session-management)
8. [Data Integrity Failures](#8-data-integrity-failures) — **HIGH**
   - 8.1 [Prevent Cross-Site Scripting (XSS)](#81-prevent-cross-site-scripting-xss-)
9. [Logging Failures](#9-logging-failures) — **MEDIUM**
   - 9.1 [Implement Security Logging](#91-implement-security-logging)
10. [SSRF](#10-ssrf) — **HIGH**
   - 10.1 [Prevent Server-Side Request Forgery (SSRF)](#101-prevent-server-side-request-forgery-ssrf-)
12. [Security Checklist](#12-security-checklist) — **MEDIUM**
   - 12.1 [Follow Pre-Deployment Security Checklist](#121-follow-pre-deployment-security-checklist)

---

## 1. Broken Access Control

**Section Impact: CRITICAL**

### 1.1 Implement Authorization Checks

**Impact: CRITICAL** — Prevents unauthorized access to resources and data

Always verify that users have permission to access or modify resources before allowing the action. Never trust user input or assume authentication implies authorization.

**Incorrect (No authorization check):**

```typescript
// ❌ BAD: No authorization check
app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  res.json(user);
});
```

**Correct (Verify ownership):**

```typescript
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

Reference: [OWASP A01: Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)

---

### 1.2 Prevent Insecure Direct Object Reference (IDOR)

**Impact: CRITICAL** — Prevents attackers from accessing other users' data by enumerating IDs

IDOR vulnerabilities occur when applications use sequential or predictable IDs without verifying ownership. Attackers can enumerate IDs to access other users' resources.

**Incorrect (Predictable IDs exposed):**

```typescript
// ❌ BAD: Predictable IDs exposed
GET /api/invoices/1001
GET /api/invoices/1002  // Can enumerate others' invoices
```

**Correct (Use UUIDs + ownership check):**

```typescript
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

Reference: [OWASP A01: Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)

---

## 2. Cryptographic Failures

**Section Impact: CRITICAL**

### 2.1 Encrypt Sensitive Data

**Impact: CRITICAL** — Protects sensitive data at rest and in transit

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

---

### 2.2 Hash Passwords Securely

**Impact: CRITICAL** — Prevents password exposure in case of data breach

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

---

### 2.3 Use Secure Headers

**Impact: HIGH** — Protects against various web vulnerabilities

Implement security headers to protect against XSS, clickjacking, and other web vulnerabilities.

**Incorrect (Missing security headers):**

```typescript
// ❌ BAD: No security headers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

**Correct (Use helmet for security headers):**

```typescript
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'strict-dynamic'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
  },
}));
```

Reference: [OWASP A02: Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)

---

## 3. Injection

**Section Impact: CRITICAL**

### 3.1 Prevent Command Injection

**Impact: CRITICAL** — Prevents attackers from executing arbitrary system commands

Never execute shell commands with user input directly. Use safe alternatives or validate and sanitize input thoroughly.

**Incorrect (Shell injection):**

```typescript
// ❌ BAD: Shell injection
import { exec } from 'child_process';
exec(`convert ${userInput} output.png`);  // userInput: "; rm -rf /"

// ❌ BAD: Template literals with user input
exec(`curl ${url}`);
```

**Correct (Use execFile with array args):**

```typescript
import { execFile } from 'child_process';

// ✅ GOOD: Use execFile with array args
execFile('convert', [userInput, 'output.png'], (error, stdout) => {
  // Safe - arguments are not shell-interpreted
});

// ✅ GOOD: Validate and sanitize
const allowedFormats = ['png', 'jpg', 'gif'];
if (!allowedFormats.includes(format)) {
  throw new Error('Invalid format');
}

// ✅ GOOD: Use allowlist for commands
const allowedCommands = ['convert', 'resize'];
if (!allowedCommands.includes(command)) {
  throw new Error('Invalid command');
}
```

Reference: [OWASP A03: Injection](https://owasp.org/Top10/A03_2021-Injection/)

---

### 3.2 Prevent NoSQL Injection

**Impact: CRITICAL** — Prevents attackers from executing malicious NoSQL queries

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

---

### 3.3 Prevent SQL Injection

**Impact: CRITICAL** — Prevents attackers from executing malicious SQL queries

Never concatenate user input into SQL queries. Always use parameterized queries or ORM methods that handle escaping automatically.

**Incorrect (String concatenation):**

```typescript
// ❌ BAD: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;
const result = await db.query(query);

// ❌ BAD: Template literals with user input
const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
```

**Correct (Parameterized queries):**

```typescript
// ✅ GOOD: Parameterized queries
// With Prisma
const user = await prisma.user.findUnique({ where: { email } });

// With raw SQL (parameterized)
const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

// With Knex
const user = await knex('users').where({ email }).first();

// ✅ GOOD: Use ORM methods
const user = await User.findOne({ where: { email } });
```

Reference: [OWASP A03: Injection](https://owasp.org/Top10/A03_2021-Injection/)

---

## 4. Insecure Design

**Section Impact: HIGH**

### 4.1 Validate All Input

**Impact: HIGH** — Prevents injection attacks and data corruption

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

---

### 4.2 Implement Rate Limiting

**Impact: HIGH** — Prevents brute force attacks and abuse

Implement rate limiting to prevent brute force attacks, DDoS, and API abuse. Use stricter limits for sensitive endpoints like authentication.

**Incorrect (No rate limiting):**

```typescript
// ❌ BAD: No rate limiting
app.post('/api/login', loginHandler);
app.get('/api/data', dataHandler);
```

**Correct (Implement rate limiting):**

```typescript
import rateLimit from 'express-rate-limit';

// General rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 failed attempts
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
```

Reference: [OWASP A04: Insecure Design](https://owasp.org/Top10/A04_2021-Insecure_Design/)

---

## 5. Security Misconfiguration

**Section Impact: HIGH**

### 5.1 Secure Environment Configuration

**Impact: HIGH** — Prevents information disclosure and misconfiguration vulnerabilities

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

---

## 6. Vulnerable Components

**Section Impact: HIGH**

### 6.1 Scan and Update Dependencies

**Impact: HIGH** — Prevents exploitation of known vulnerabilities

Regularly scan dependencies for vulnerabilities and keep them updated. Use automated tools to detect and fix security issues.

**Incorrect (No dependency management):**

```bash
# ❌ BAD: Never checking for vulnerabilities
npm install
npm start

# ❌ BAD: Ignoring audit warnings
npm audit
# 15 vulnerabilities found - ignored
```

**Correct (Regular scanning and updates):**

```bash
# ✅ Check for vulnerabilities
npm audit
npm audit fix

# ✅ Use Snyk for deeper scanning
npx snyk test
npx snyk monitor

# ✅ Keep dependencies updated
npx npm-check-updates -u
```

```json
// package.json - Use exact versions or ranges
{
  "dependencies": {
    "express": "^4.18.0",  // Minor updates OK
    "lodash": "4.17.21"    // Exact version
  },
  "overrides": {
    "vulnerable-package": "^2.0.0"  // Force safe version
  }
}
```

Reference: [OWASP A06: Vulnerable Components](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/)

---

## 7. Authentication Failures

**Section Impact: CRITICAL**

### 7.1 Implement Multi-Factor Authentication

**Impact: CRITICAL** — Prevents account compromise even if passwords are stolen

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

---

### 7.2 Implement Secure Password Reset

**Impact: CRITICAL** — Prevents account takeover through password reset vulnerabilities

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

---

### 7.3 Implement Secure Session Management

**Impact: CRITICAL** — Prevents session hijacking and unauthorized access

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

---

## 8. Data Integrity Failures

**Section Impact: HIGH**

### 8.1 Prevent Cross-Site Scripting (XSS)

**Impact: HIGH** — Prevents attackers from executing scripts in users' browsers

XSS allows attackers to execute malicious scripts in users' browsers. Use proper output encoding, CSP, and sanitization to prevent XSS.

**Incorrect (Unsafe HTML rendering):**

```typescript
// ❌ BAD: Rendering unescaped HTML
const UserProfile = ({ user }) => (
  <div dangerouslySetInnerHTML={{ __html: user.bio }} />
);

// ❌ BAD: No CSP
app.use(express.static('public'));
```

**Correct (Use auto-escaping and CSP):**

```typescript
// ✅ React auto-escapes by default
const UserProfile = ({ user }) => (
  <div>{user.name}</div>  // Safe - auto-escaped
);

// ✅ Sanitize HTML if needed
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(userHtml, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href'],
});

// ✅ Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'self'"],  // No inline scripts
    styleSrc: ["'self'", "'unsafe-inline'"],
  },
}));
```

Reference: [OWASP A08: Software and Data Integrity Failures](https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/)

---

## 9. Logging Failures

**Section Impact: MEDIUM**

### 9.1 Implement Security Logging

**Impact: MEDIUM** — Enables detection of security incidents and forensic analysis

Log security events like failed logins, access denials, and suspicious activities. Use structured logging for easy analysis.

**Incorrect (No security logging):**

```typescript
// ❌ BAD: No security logging
app.post('/login', async (req, res) => {
  const user = await authenticate(email, password);
  res.json({ token });
});

// ❌ BAD: Logging sensitive data
console.log('User login:', { email, password });
```

**Correct (Structured security logging):**

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// ✅ Log security events
function logSecurityEvent(event: string, details: object) {
  logger.warn({
    type: 'security',
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
}

// Usage
logSecurityEvent('failed_login', { email, ip: req.ip, userAgent: req.headers['user-agent'] });
logSecurityEvent('access_denied', { userId, resource, action });
logSecurityEvent('suspicious_activity', { userId, pattern: 'rapid_requests' });
```

Reference: [OWASP A09: Security Logging and Monitoring Failures](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/)

---

## 10. SSRF

**Section Impact: HIGH**

### 10.1 Prevent Server-Side Request Forgery (SSRF)

**Impact: HIGH** — Prevents attackers from forcing the server to make requests to internal systems

SSRF allows attackers to force the server to make requests to internal systems. Validate URLs against allowlists and block private IP ranges.

**Incorrect (No URL validation):**

```typescript
// ❌ BAD: No URL validation
app.post('/api/fetch-url', async (req, res) => {
  const { url } = req.body;
  const response = await fetch(url);
  res.json(await response.json());
});

// ❌ BAD: Only checking protocol
if (url.startsWith('http://') || url.startsWith('https://')) {
  const response = await fetch(url);
}
```

**Correct (Validate URLs against allowlist):**

```typescript
import { URL } from 'url';

// ✅ Validate URLs against allowlist
const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com'];

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    
    // Block private IPs
    const privatePatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^0\./,
      /^169\.254\./,  // Link-local
    ];
    
    if (privatePatterns.some(p => p.test(url.hostname))) {
      return false;
    }
    
    // Check allowlist
    return ALLOWED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

app.post('/api/fetch-url', async (req, res) => {
  const { url } = req.body;
  
  if (!isAllowedUrl(url)) {
    return res.status(400).json({ error: 'URL not allowed' });
  }
  
  const response = await fetch(url);
  // ...
});
```

Reference: [OWASP A10: Server-Side Request Forgery](https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_SSRF/)

---

## 12. Security Checklist

**Section Impact: MEDIUM**

### 12.1 Follow Pre-Deployment Security Checklist

**Impact: MEDIUM** — Ensures all security measures are in place before deployment

Use a comprehensive security checklist to verify all security measures are implemented before deploying to production.

**Incorrect (No pre-deployment verification):**

```markdown
# ❌ BAD: No checklist - just deploy
git push production
```

**Correct (Use comprehensive security checklist):**

```markdown
## Pre-Deployment Checklist

### Authentication
- [ ] Passwords hashed with bcrypt (cost ≥ 12)
- [ ] JWT tokens have short expiry
- [ ] Session cookies are httpOnly, secure, sameSite
- [ ] Rate limiting on auth endpoints

### Authorization
- [ ] All endpoints have auth checks
- [ ] RBAC implemented correctly
- [ ] No IDOR vulnerabilities

### Input/Output
- [ ] All input validated with Zod/Joi
- [ ] SQL queries parameterized
- [ ] XSS prevented (CSP, escaping)
- [ ] File uploads validated and sandboxed

### Infrastructure
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Dependencies audited
- [ ] Secrets in environment variables

### Monitoring
- [ ] Security events logged
- [ ] Error monitoring enabled
- [ ] Alerts configured
```

Reference: [OWASP Top 10](https://owasp.org/Top10/)

---

## References

- OWASP Top 10: https://owasp.org/Top10/
- OWASP Cheat Sheets: https://cheatsheetseries.owasp.org/
- Node.js Security: https://nodejs.org/en/docs/guides/security/
- Snyk: https://snyk.io/

---

*Generated by build-agents.ts on 2026-06-18*
