# Deploying to Vercel

This app already includes a Vercel setup (`vercel.json` + `api/index.js`). Vercel runs Express as a serverless function.

## What works on Vercel

- Home page, search, login, registration, profile
- Likes, comments, and viewing posts already in the database
- Static assets (CSS, JS, favicon, committed videos in `public/videos/`)

## What does not work on Vercel

- **New video uploads** — serverless functions use ephemeral storage; uploaded files are not saved or served after the request ends. Use local dev, Render, or Railway for uploads.

## Prerequisites

1. A **remote MySQL** database (PlanetScale, Railway, Aiven, etc.).
2. Tables created from the SQL in `README.md` (`user`, `post`, `comment`, `likes`, `sessions`).
3. Repo on GitHub.

## Deploy steps

### 1. Import the project

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository (`Computer-Science-Projects`).

**Option A — deploy from repo root (recommended, works out of the box):**

- Leave **Root Directory** empty (repo root).
- The root `vercel.json` and `api/index.js` route all traffic to the Express app.

**Option B — deploy from the app folder:**

- Set **Root Directory** to `csc317-code-sahilanxnd/application`.
- Uses `application/vercel.json` and `application/api/index.js`.

For both options:

3. Framework Preset: **Other**.
4. Output Directory: leave **empty** (do not set `public`).

### 2. Environment variables

In **Settings → Environment Variables**, add for **Production** (and Preview if you want):

| Variable      | Example              |
|---------------|----------------------|
| `DB_HOST`     | your-db-host.com     |
| `DB_USER`     | your_username        |
| `DB_PASSWORD` | your_password        |
| `DB_NAME`     | videoapp             |
| `DB_PORT`     | 3306                 |
| `NODE_ENV`    | production           |

Do **not** set `PORT` — Vercel assigns the port automatically.

### 3. Deploy

Click **Deploy**. When it finishes, open your `*.vercel.app` URL.

### 4. Seed the database (one time)

From your machine with `.env` pointing at the same remote database:

```bash
cd csc317-code-sahilanxnd/application
npm install
npm run builddb
```

## Test locally with Vercel CLI

```bash
npm install -g vercel
cd csc317-code-sahilanxnd/application
cp .env.example .env
# Edit .env with your database credentials
vercel dev
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `404: NOT_FOUND` on every page | Vercel has no matching route. Leave **Root Directory** empty (repo root) *or* set it to `csc317-code-sahilanxnd/application` — not both configs. Clear **Output Directory** if it is set to `public`. Redeploy after pushing the latest `vercel.json`. |
| 500 / FUNCTION_INVOCATION_FAILED | Check **Logs** in Vercel dashboard. Usually wrong `DB_*` values or DB not reachable from the internet. |
| Login session not sticking | Set `NODE_ENV=production` so cookies use `secure: true` over HTTPS. |
| Registration/login errors | Ensure the remote DB has the `user` table and SSL is allowed (the app uses `rejectUnauthorized: false` for MySQL SSL). |
| Upload fails | Expected on Vercel; use Render/Railway for persistent uploads. |

## Vercel vs Netlify

Both run this app as serverless functions with the same limitations. Vercel’s free tier is often more generous for hobby projects. Use whichever platform you have credits on.
