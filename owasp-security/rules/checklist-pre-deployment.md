---
title: Follow Pre-Deployment Security Checklist
impact: MEDIUM
impactDescription: Ensures all security measures are in place before deployment
tags: checklist, deployment, security, verification
---

## Follow Pre-Deployment Security Checklist

**Impact: MEDIUM (Ensures all security measures are in place before deployment)**

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
