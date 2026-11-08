# zzxxccvvbbnnmm

Private two-person messaging app scaffold. This is not production-ready yet.

## Stack
- Next.js App Router + TypeScript + Tailwind CSS
- Supabase Postgres/Storage
- Argon2id password verification
- HttpOnly, Secure, SameSite=Strict session cookie

## Required server-only environment
Copy `.env.example` to `.env.local` for local development. Never commit real values.

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — server only; never prefix with NEXT_PUBLIC_
- `AUTH_PERSON_1_PASSWORD_HASH`
- `AUTH_PERSON_2_PASSWORD_HASH`

Generate each password hash using Argon2id in a trusted local environment. Use two different, long, random passwords. Never send plaintext passwords in chat or commit them to Git.

## Current implementation status
- Password-only two-person login endpoint and hashed server-side sessions.
- Refresh and tab-hidden lock request.
- Login page only; message UI, key exchange, client-side encryption, message APIs, attachment handling, RLS/storage authorization, rate limiting, and security review remain to be implemented.
- Do not store sensitive content until end-to-end encryption and authorization have been implemented and independently tested.

## Local development
```bash
npm install
npm run dev
```
