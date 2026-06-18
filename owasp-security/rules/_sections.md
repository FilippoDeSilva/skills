# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. Broken Access Control (a01)

**Impact:** CRITICAL
**Description:** Broken access control is the most common and critical vulnerability. Users can access data or perform actions they shouldn't be able to.

## 2. Cryptographic Failures (a02)

**Impact:** CRITICAL
**Description:** Cryptographic failures lead to exposure of sensitive data. Proper encryption, secure storage, and strong hashing are essential.

## 3. Injection (a03)

**Impact:** CRITICAL
**Description:** Injection vulnerabilities allow attackers to execute malicious queries or commands. Input validation and parameterized queries are critical.

## 4. Insecure Design (a04)

**Impact:** HIGH
**Description:** Insecure design flaws are fundamental architectural issues. Threat modeling and secure patterns must be considered from the start.

## 5. Security Misconfiguration (a05)

**Impact:** HIGH
**Description:** Misconfigured security settings, default credentials, and exposed debug information create easy attack vectors.

## 6. Vulnerable Components (a06)

**Impact:** HIGH
**Description:** Using vulnerable dependencies or outdated components introduces known security risks.

## 7. Authentication Failures (a07)

**Impact:** CRITICAL
**Description:** Weak authentication mechanisms allow unauthorized access. MFA, secure session management, and proper password policies are essential.

## 8. Data Integrity Failures (a08)

**Impact:** HIGH
**Description:** Data integrity failures allow attackers to modify data without detection. Input validation and signed updates are critical.

## 9. Logging Failures (a09)

**Impact:** MEDIUM
**Description:** Insufficient logging and monitoring prevent detection of security incidents and make incident response difficult.

## 10. SSRF (a10)

**Impact:** HIGH
**Description:** Server-Side Request Forgery allows attackers to force the server to make requests to internal systems.

## 11. XSS Prevention (xss)

**Impact:** HIGH
**Description:** Cross-Site Scripting allows attackers to execute scripts in users' browsers. Proper output encoding and CSP are essential.

## 12. Security Checklist (checklist)

**Impact:** MEDIUM
**Description:** Comprehensive security checklist for pre-deployment verification.
