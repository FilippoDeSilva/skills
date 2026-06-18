---
title: Implement Security Logging
impact: MEDIUM
impactDescription: Enables detection of security incidents and forensic analysis
tags: logging, monitoring, winston, security-events
---

## Implement Security Logging

**Impact: MEDIUM (Enables detection of security incidents and forensic analysis)**

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
