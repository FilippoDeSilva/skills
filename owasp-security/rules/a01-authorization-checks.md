---
title: Implement Authorization Checks
impact: CRITICAL
impactDescription: Prevents unauthorized access to resources and data
tags: access-control, authorization, rbac, idor
---

## Implement Authorization Checks

**Impact: CRITICAL (Prevents unauthorized access to resources and data)**

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
