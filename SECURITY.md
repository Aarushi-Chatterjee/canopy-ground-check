# Security Policy

## Reporting a Vulnerability

If you discover a security issue in this repository, please **do not open a public GitHub issue**.

Instead, email: [your-security-email@example.com]

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact

We will respond within 48 hours and coordinate a fix before any public disclosure.

## Scope

This repository contains the CANOPY Ground Check questionnaire — a static Vite/React SPA.

**In scope:**
- XSS vulnerabilities in the questionnaire UI
- Data exposure of collected email addresses
- Formspree endpoint abuse (spam/spoofing)
- Content Security Policy bypasses

**Out of scope:**
- Formspree platform security (report to Formspree directly)
- Vercel platform security (report to Vercel directly)
- Social engineering attacks

## Data Handling

- Email addresses are submitted to Formspree and stored per their privacy policy.
- No email data is stored in this repository or committed to version control.
- Users may request deletion of their data by contacting us at the email above.

## Security Best Practices for Contributors

- Never commit `.env` files or real API keys.
- Use `.env.example` with placeholder values only.
- All form submissions are domain-locked in Formspree (Allowed Domains setting).
- The CSP header in `vercel.json` restricts `connect-src` to `formspree.io` only.
