---
title: Prevent Server-Side Request Forgery (SSRF)
impact: HIGH
impactDescription: Prevents attackers from forcing the server to make requests to internal systems
tags: ssrf, url-validation, allowlist, internal-networks
---

## Prevent Server-Side Request Forgery (SSRF)

**Impact: HIGH (Prevents attackers from forcing the server to make requests to internal systems)**

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
