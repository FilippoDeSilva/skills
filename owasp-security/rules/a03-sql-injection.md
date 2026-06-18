---
title: Prevent SQL Injection
impact: CRITICAL
impactDescription: Prevents attackers from executing malicious SQL queries
tags: sql-injection, parameterized-queries, prisma, database
---

## Prevent SQL Injection

**Impact: CRITICAL (Prevents attackers from executing malicious SQL queries)**

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
