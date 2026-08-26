# ICMHS Enrollment Deferment System

A two-part app:
- **`/apply`** — public student form. Anyone can submit a request. This page has
  no code path that reads data back — it can only write.
- **`/admin`** — registrar dashboard. Sits behind a password checked on the
  server; the session cookie is signed and `httpOnly`, so it can't be read or
  forged from the browser.

Data is stored in a real Postgres database (via Neon, connected through
Vercel), not in this codebase.

## 1. Create the database

1. In the [Vercel dashboard](https://vercel.com/dashboard), open (or create)
   this project.
2. Go to **Storage** → **Create Database** → choose **Postgres** (this
   provisions a Neon-backed database and wires up `DATABASE_URL`
   automatically — you don't need a separate Neon account).
3. Once created, open the database's **Query** tab and paste in the contents
   of `db/schema.sql` from this repo, then run it. This creates the
   `deferment_requests` table.

## 2. Set environment variables

In **Project Settings → Environment Variables**, add:

| Name                 | Value                                              |
|----------------------|-----------------------------------------------------|
| `REGISTRAR_PASSWORD` | The password staff will type in to reach `/admin`  |
| `SESSION_SECRET`     | A random string — generate with `openssl rand -hex 32` |

`DATABASE_URL` is set automatically by step 1 — you don't need to add it.

## 3. Deploy

Push this folder to a GitHub repo and import it in Vercel, or run:

```
npm install -g vercel
vercel
```

and follow the prompts. Vercel will detect this as a Next.js app
automatically.

## 4. Test it

- Visit `/apply` (or just `/`, which redirects there) and submit a test
  request.
- Visit `/admin`, sign in with `REGISTRAR_PASSWORD`, and confirm the test
  request shows up. Approve or deny it and confirm the status updates.

## Local development

```
npm install
cp .env.example .env.local   # fill in DATABASE_URL, REGISTRAR_PASSWORD, SESSION_SECRET
npm run dev
```

## Notes

- Programs, campuses, and intake months are hardcoded in
  `app/apply/page.js` — edit the `<option>` lists there if your catalog
  changes.
- The logo is pulled live from `https://images.icmhs.co.ke/...` — if that
  path ever changes on the main site, update the `src` in
  `app/apply/page.js` and `app/admin/page.js`.
- To change branding colors, edit the CSS variables at the top of
  `app/globals.css`.
