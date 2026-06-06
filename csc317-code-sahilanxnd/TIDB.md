# Migrate from Aiven MySQL to TiDB Cloud

TiDB is **MySQL-compatible**, so your app code stays the same. You only change connection settings and recreate the tables.

## Part 1 — Create TiDB Cloud cluster

1. Go to [console.tidbcloud.com](https://console.tidbcloud.com) and sign up / log in.
2. Click **Create Cluster** (free **Starter** tier is fine for class projects).
3. Pick a region close to you and wait until status is **Active**.

## Part 2 — Get connection info

1. Open your cluster → click **Connect** (top right).
2. Set:
   - **Connect With:** General
   - **Connection Type:** Public
   - **Operating System:** your OS
3. Copy from the dialog:

| TiDB field | Put in `.env` / Vercel |
|------------|-------------------------|
| Host | `DB_HOST` |
| Port (usually `4000`) | `DB_PORT` |
| User (e.g. `xxxxx.root`) | `DB_USER` |
| Password | `DB_PASSWORD` |
| Database | `DB_NAME` — use `videoapp` or `test` |

4. Set `TIDB_ENABLE_SSL=true` (required for public endpoints).

## Part 3 — Configure locally

```bash
cd csc317-code-sahilanxnd/application
cp .env.example .env
```

Edit `.env` with your TiDB values:

```env
DB_HOST=gateway01.us-west-2.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=xxxxxxxx.root
DB_PASSWORD=your_password
DB_NAME=videoapp
TIDB_ENABLE_SSL=true
NODE_ENV=development
PORT=3000
```

Create tables:

```bash
npm install
npm run builddb
```

Expected output: `🎉 Database setup complete.`

## Part 4 — Configure Vercel

**Settings → Environment variables** — replace old Aiven values:

| Variable | Value |
|----------|--------|
| `DB_HOST` | TiDB host |
| `DB_PORT` | `4000` |
| `DB_USER` | TiDB user |
| `DB_PASSWORD` | TiDB password |
| `DB_NAME` | `videoapp` |
| `TIDB_ENABLE_SSL` | `true` |
| `NODE_ENV` | `production` |

Remove old Aiven-only vars if you had them. **Redeploy** after saving.

## Part 5 — Migrate existing data (optional)

Only needed if you had real users/posts on Aiven that still work.

### If Aiven still connects

Export from Aiven:

```bash
mysqldump -h OLD_AIVEN_HOST -P OLD_PORT -u avnadmin -p --databases defaultdb > backup.sql
```

Import to TiDB:

```bash
mysql -h YOUR_TIDB_HOST -P 4000 -u YOUR_TIDB_USER -p --ssl-mode=REQUIRED < backup.sql
```

### If Aiven is dead (your case)

Skip export — run `npm run builddb` on TiDB for a fresh database. Re-register users and re-upload videos locally.

## Part 6 — Shut down Aiven

After TiDB works, delete or power off the Aiven service to avoid charges.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ENOTFOUND` | Wrong `DB_HOST` — copy again from TiDB Connect dialog |
| `TLS` / SSL error | Set `TIDB_ENABLE_SSL=true` on Vercel |
| `Connections using insecure transport are prohibited` | Ensure latest `app.js` is deployed (session store must use a TLS-enabled mysql pool) |
| `Access denied` | Reset password in TiDB console, update `.env` + Vercel |
| `ER_BAD_DB_ERROR` | Run `npm run builddb` or set `DB_NAME=test` |

## What changed in the code

- `conf/db-config.js` — shared connection settings; auto-detects TiDB by `tidbcloud.com` host or `TIDB_ENABLE_SSL=true`
- TiDB uses TLS 1.2+ (required for public endpoints)
- Aiven still works if you keep a non-TiDB host (uses relaxed SSL)
