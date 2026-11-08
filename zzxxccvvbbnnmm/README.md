# zzxxccvvbbnnmm

Private two-person messaging app scaffold.

## Stack
- Next.js App Router + TypeScript + Tailwind CSS
- Supabase Postgres/Storage
- Argon2id password verification
- HttpOnly, Secure, SameSite=Strict session cookie
- Server-only RPC secret; no Supabase service-role key in the app

## Required server-only environment
Set these as encrypted/sensitive Vercel environment variables. Never commit real values or prefix secrets with `NEXT_PUBLIC_`.

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `CHAT_RPC_SECRET` — generated server-only RPC secret; already provisioned for this Vercel project
- `AUTH_PERSON_1_PASSWORD_HASH`
- `AUTH_PERSON_2_PASSWORD_HASH`

Generate each password hash locally:
1. Run `npm install`.
2. Run `npm run hash-password` in a private terminal.
3. Type a unique password of at least 12 characters; input is hidden.
4. Save the resulting Argon2id hash directly in the matching Vercel environment variable.
5. Repeat for the second person. Never send plaintext passwords in chat or commit them to Git.

## Current implementation status
- Two-password authentication (passwords are identified by server-side Argon2id hashes).
- Random opaque sessions; only SHA-256 token hashes are stored in the database.
- HttpOnly, Secure, SameSite=Strict cookie; eight-hour server expiry.
- Refresh/page-exit and tab-hidden lock requests (browser delivery is best-effort).
- Database-backed login rate limiting.
- Private chat schema and private 100 MB encrypted-media bucket already exist.
- The messaging interface, verified end-to-end key exchange, encryption/decryption, encrypted message APIs, media streaming, storage authorization, and security review remain to be implemented.
- Do not use this app for private messages or files until end-to-end encryption and authorization have been implemented and independently tested.

## Local development
```bash
npm install
npm run dev
```
