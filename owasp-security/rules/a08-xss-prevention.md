---
title: Prevent Cross-Site Scripting (XSS)
impact: HIGH
impactDescription: Prevents attackers from executing scripts in users' browsers
tags: xss, csp, escaping, dompurify
---

## Prevent Cross-Site Scripting (XSS)

**Impact: HIGH (Prevents attackers from executing scripts in users' browsers)**

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
