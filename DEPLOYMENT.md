# Ovula — Cloud Deployment Guide

Deploy the full Ovula PCOS Tracking System to the cloud using **Render** (backend + database) and **Vercel** (frontend) — both on free tiers.

---

## Prerequisites

Create free accounts on:
- 🔵 [render.com](https://render.com) — backend & database
- ▲ [vercel.com](https://vercel.com) — frontend
- 🟠 [console.groq.com](https://console.groq.com) — free AI (get an API key)

---

## Step 1 — Push to GitHub

The `render.yaml` and `vercel.json` files must be on GitHub for auto-detection.

```bash
git add .
git commit -m "chore: add cloud deployment config"
git push origin main
```

---

## Step 2 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → **New** → **Blueprint**
2. Connect your GitHub repo
3. Render will auto-detect `render.yaml` and create:
   - ✅ `ovula-backend` web service (FastAPI)
   - ✅ `ovula-db` PostgreSQL database
4. In the `ovula-backend` service → **Environment** tab, manually set these **sensitive** variables:

   | Key | Value |
   |---|---|
   | `OPENAI_API_KEY` | Your Groq API key from console.groq.com |
   | `SMTP_USERNAME` | Your Gmail address |
   | `SMTP_PASSWORD` | Your Gmail App Password |
   | `FROM_EMAIL` | Your Gmail address |
   | `APP_URL` | Your Vercel frontend URL (set after Step 3) |
   | `ELEVENLABS_API_KEY` | Your ElevenLabs key (if using TTS) |

5. Click **Deploy** — wait ~3 minutes for the first build
6. Note your backend URL: `https://ovula-backend.onrender.com`

> **Test it:** Open `https://ovula-backend.onrender.com/health` — should return `{"status":"healthy"}`

---

## Step 3 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure the project:
   - **Root Directory:** `src/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Add **Environment Variable**:

   | Key | Value |
   |---|---|
   | `REACT_APP_API_URL` | `https://ovula-backend.onrender.com` |

5. Click **Deploy** — takes ~2 minutes
6. Note your frontend URL: `https://ovula-frontend.vercel.app`

---

## Step 4 — Link Frontend URL to Backend

Go back to Render → `ovula-backend` → **Environment** → update `APP_URL`:
```
APP_URL=https://ovula-frontend.vercel.app
```
Click **Save Changes** → Render redeploys automatically.

---

## Step 5 — Verify

```bash
# Backend health
curl https://ovula-backend.onrender.com/health

# Swagger UI (test all endpoints)
open https://ovula-backend.onrender.com/docs
```

Then open your Vercel URL in a browser → register → verify OTP → log in.

---

## Useful URLs After Deployment

| Service | URL |
|---|---|
| Frontend | `https://ovula-frontend.vercel.app` |
| Backend API | `https://ovula-backend.onrender.com` |
| Swagger Docs | `https://ovula-backend.onrender.com/docs` |
| Health Check | `https://ovula-backend.onrender.com/health` |

---

## Notes

- **Render free tier** sleeps after 15 min of inactivity. First request after sleep takes ~30 sec to wake up.
- **Vercel** is always-on with no cold starts.
- **Database** data persists on Render's free PostgreSQL (1 GB limit).
- To run locally, use `./run.sh` from the project root.
