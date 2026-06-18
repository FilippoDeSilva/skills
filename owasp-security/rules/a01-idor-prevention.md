---
title: Prevent Insecure Direct Object Reference (IDOR)
impact: CRITICAL
impactDescription: Prevents attackers from accessing other users' data by enumerating IDs
tags: idor, access-control, uuid, ownership
---

## Prevent Insecure Direct Object Reference (IDOR)

**Impact: CRITICAL (Prevents attackers from accessing other users' data by enumerating IDs)**

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
