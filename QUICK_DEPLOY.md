# 🚀 Quick Deploy Guide - 5 Minutes to Production

Deploy your Ovula PCOS app to the cloud in 5 minutes using free tools!

## ✅ Prerequisites Checklist

Before starting, create these free accounts:
- [ ] [Railway Account](https://railway.app/) (GitHub login)
- [ ] [Vercel Account](https://vercel.com/) (GitHub login)
- [ ] [Groq API Key](https://console.groq.com/) (Free tier)
- [ ] Gmail account for OTP emails

---

## 🎯 Step 1: Get Groq API Key (2 minutes)

1. Go to https://console.groq.com/
2. Sign up with Google/GitHub
3. Click "API Keys" in sidebar
4. Click "Create API Key"
5. Copy the key (starts with `gsk_...`)

**Save this key - you'll need it in Step 3!**

---

## 🔧 Step 2: Deploy Backend to Railway (2 minutes)

### Option A: Deploy from GitHub (Recommended)

1. Push your code to GitHub
2. Go to https://railway.app/
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will auto-detect and start deploying

### Option B: Deploy with Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Add PostgreSQL Database

1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Database will be automatically linked
3. `DATABASE_URL` environment variable is auto-created

---

## 🔐 Step 3: Configure Backend Environment Variables

In Railway dashboard, go to your backend service → "Variables" tab and add:

```env
# Required - Security
SECRET_KEY=your-super-secret-key-min-32-characters-change-this

# Required - Groq LLM
MODEL_TYPE=groq_api
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile

# Required - Email OTP
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com

# Auto-provided by Railway
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Optional - Keep defaults
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OTP_ENABLED=true
EMAIL_BACKEND=smtp
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
APP_NAME=Ovula
```

### 📧 How to Get Gmail App Password:

1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Search for "App Passwords"
4. Generate password for "Mail"
5. Copy the 16-character password
6. Use this as `SMTP_PASSWORD`

**After adding variables, Railway will automatically redeploy!**

Copy your backend URL (looks like: `https://your-app.railway.app`)

---

## 🎨 Step 4: Deploy Frontend to Vercel (1 minute)

### Option A: Deploy from GitHub (Recommended)

1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `src/frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   ```
   (Use the Railway URL from Step 3)

6. Click "Deploy"

### Option B: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd src/frontend

# Deploy
vercel

# Follow prompts:
# - Set root directory: ./
# - Override settings: No
# - Add environment variable: REACT_APP_API_URL
```

**Your app will be live at: `https://your-app.vercel.app`**

---

## 🔄 Step 5: Update Backend with Frontend URL

Go back to Railway → Backend service → Variables:

```env
APP_URL=https://your-app.vercel.app
```

This allows OTP emails to include the correct verification link.

---

## ✅ Step 6: Test Your Deployment

### Test Backend Health

```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_type": "groq_api"
}
```

### Test Frontend

1. Visit `https://your-app.vercel.app`
2. Click "Sign Up"
3. Register with your email
4. Check email for OTP code
5. Verify and login
6. Test AI chat feature

---

## 🎉 Success! Your App is Live!

**Backend**: `https://your-backend.railway.app`  
**Frontend**: `https://your-app.vercel.app`

### What's Working:
✅ User registration with email OTP  
✅ Login/authentication  
✅ Daily symptom logging  
✅ AI chat with Groq LLM  
✅ Urdu translation  
✅ Cycle tracking  
✅ PCOS prediction  
✅ Health insights  

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: "Database connection error"
```bash
# Solution: Check DATABASE_URL format
# Railway provides postgres://, but SQLAlchemy needs postgresql://
# The code handles this automatically - check logs
```

**Problem**: "Groq API error"
```bash
# Solution: Verify GROQ_API_KEY
# Check rate limits (free tier: 30 requests/minute)
# Ensure MODEL_TYPE=groq_api
```

**Problem**: "OTP emails not sending"
```bash
# Solution: Use Gmail App Password
# 1. Enable 2FA on Gmail
# 2. Generate App Password
# 3. Use that password in SMTP_PASSWORD
```

### Frontend Issues

**Problem**: "Failed to fetch" errors
```bash
# Solution: Check REACT_APP_API_URL
# Must match your Railway backend URL
# Redeploy frontend after changing env vars
```

**Problem**: CORS errors
```bash
# Solution: Backend CORS is set to allow all origins
# Check browser console for actual error
# Verify backend is running
```

---

## 📊 Monitoring & Logs

### Railway Logs
```bash
# View backend logs
railway logs
```

Or in Railway dashboard → Service → "Deployments" → Click deployment → "View Logs"

### Vercel Logs

In Vercel dashboard → Project → "Deployments" → Click deployment → "View Function Logs"

---

## 🔄 Updating Your App

### Update Backend
```bash
git push origin main
# Railway auto-deploys on push
```

### Update Frontend
```bash
git push origin main
# Vercel auto-deploys on push
```

### Manual Redeploy
- **Railway**: Dashboard → Service → "Deploy" → "Redeploy"
- **Vercel**: Dashboard → Project → "Deployments" → "Redeploy"

---

## 💰 Cost Breakdown

| Service | Free Tier | Your Usage |
|---------|-----------|------------|
| Railway | $5 credit/month | Backend + PostgreSQL |
| Vercel | Unlimited | Frontend |
| Groq | 30 req/min | LLM API |
| Gmail | Unlimited | OTP emails |

**Total: $0/month** (within free tiers)

---

## 🎯 Next Steps

1. **Custom Domain** (Optional)
   - Railway: Settings → Domains → Add custom domain
   - Vercel: Settings → Domains → Add domain

2. **SSL Certificates**
   - Automatic on both Railway and Vercel ✅

3. **Monitoring**
   - Railway: Built-in metrics
   - Vercel: Analytics dashboard

4. **Backups**
   - Railway PostgreSQL: Automatic backups
   - Export data: `railway run pg_dump`

---

## 📞 Need Help?

- **Railway Docs**: https://docs.railway.app/
- **Vercel Docs**: https://vercel.com/docs
- **Groq Docs**: https://console.groq.com/docs
- **GitHub Issues**: Open an issue in your repo

---

## 🎊 Congratulations!

Your PCOS tracking app is now live and accessible worldwide! 🌍

Share your app URL with users and start helping people manage their PCOS journey! 💜
