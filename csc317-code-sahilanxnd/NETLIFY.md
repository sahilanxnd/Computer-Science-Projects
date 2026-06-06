# Deploying to Netlify

This app is an Express server with MySQL. Netlify runs it as a **serverless function** (not a always-on Node server), so a few setup steps are required.

## What works on Netlify

- Home page, search, login, registration, profile
- Likes, comments, and post viewing (for videos already in the database)
- Static assets (CSS, JS, favicon)

## What does not work on Netlify

- **New video uploads** — Netlify Functions use ephemeral storage. Uploaded files are not persisted or served after the request ends. Use local development or a host with persistent disk (Render, Railway, etc.) for uploads.

## Prerequisites

1. A **remote MySQL** database (local MySQL is not reachable from Netlify). Options include [PlanetScale](https://planetscale.com), [Railway](https://railway.app), [Aiven](https://aiven.io), or another hosted MySQL provider.
2. Run the SQL schema from the main README in that database (tables: `user`, `post`, `comment`, `likes`, `sessions`).
3. Your repo pushed to GitHub (or GitLab/Bitbucket).

## Deploy steps

### 1. Connect the site

1. Go to [app.netlify.com](https://app.netlify.com) and click **Add new site → Import an existing project**.
2. Connect your Git provider and select this repository.
3. Netlify should detect `netlify.toml` at the repo root. Confirm:
   - **Base directory:** `csc317-code-sahilanxnd/application` (set automatically via `netlify.toml`)
   - **Build command:** `npm install`
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`

### 2. Set environment variables

In **Site configuration → Environment variables**, add:

| Variable      | Example              |
|---------------|----------------------|
| `DB_HOST`     | your-db-host.com     |
| `DB_USER`     | your_username        |
| `DB_PASSWORD` | your_password        |
| `DB_NAME`     | videoapp             |
| `DB_PORT`     | 3306                 |
| `NODE_ENV`    | production           |

Netlify sets `NETLIFY=true` automatically during builds and function runs.

### 3. Deploy

Click **Deploy site**. After the build finishes, open your `*.netlify.app` URL.

### 4. Seed the database (one time)

From your machine (with `.env` pointing at the same remote database):

```bash
cd csc317-code-sahilanxnd/application
npm install
npm run builddb
```

Or run the SQL from the README manually in your MySQL client.

## Test locally with Netlify Dev

```bash
npm install -g netlify-cli
cd csc317-code-sahilanxnd/application
cp .env.example .env
# Edit .env with your database credentials
netlify dev
```

Run this from the **repository root** so Netlify picks up the root `netlify.toml`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 500 errors on every page | Check function logs in Netlify → **Functions** → **server**. Usually missing or wrong `DB_*` variables. |
| Login session not sticking | Ensure `NODE_ENV=production` so cookies use `secure: true` over HTTPS. |
| CSS/JS 404 | Confirm `publish = "public"` and that `/public/*` redirects exist in `netlify.toml`. |
| Upload fails | Expected on Netlify; see limitation above. |

## Alternative for full features

If you need video uploads in production, deploy the same app to [Render](https://render.com) or [Railway](https://railway.app) with `npm start` and a persistent filesystem. Keep Netlify for a demo of auth, comments, and browsing only.
