# ✅ Deployment Checklist

Use this checklist to deploy your Ovula app step-by-step.

---

## 📋 Pre-Deployment (5 minutes)

### 1. Create Accounts
- [ ] Railway account created (https://railway.app/)
- [ ] Vercel account created (https://vercel.com/)
- [ ] Groq account created (https://console.groq.com/)
- [ ] Gmail account ready for OTP

### 2. Get API Keys
- [ ] Groq API key obtained: `gsk_...`
- [ ] Gmail App Password generated (16 characters)
- [ ] Secret key generated: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

### 3. Prepare Code
- [ ] Code pushed to GitHub
- [ ] All files committed
- [ ] .env files NOT committed (in .gitignore)

---

## 🚂 Backend Deployment - Railway (5 minutes)

### Step 1: Create Project
- [ ] Go to Railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository
- [ ] Wait for initial deployment

### Step 2: Add Database
- [ ] Click "New" in project
- [ ] Select "Database" → "PostgreSQL"
- [ ] Wait for database to provision
- [ ] Verify `DATABASE_URL` variable exists

### Step 3: Configure Environment Variables
Go to Backend Service → Variables tab:

#### Required Variables
- [ ] `SECRET_KEY` = (your generated secret key)
- [ ] `MODEL_TYPE` = `groq_api`
- [ ] `GROQ_API_KEY` = `gsk_...` (your Groq key)
- [ ] `GROQ_MODEL` = `llama-3.1-70b-versatile`
- [ ] `SMTP_USERNAME` = (your Gmail address)
- [ ] `SMTP_PASSWORD` = (your Gmail App Password)
- [ ] `FROM_EMAIL` = (your Gmail address)

#### Auto-Provided Variables
- [ ] `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (auto-filled)

#### Optional Variables (use defaults)
- [ ] `ALGORITHM` = `HS256`
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` = `30`
- [ ] `OTP_ENABLED` = `true`
- [ ] `EMAIL_BACKEND` = `smtp`
- [ ] `SMTP_SERVER` = `smtp.gmail.com`
- [ ] `SMTP_PORT` = `587`
- [ ] `APP_NAME` = `Ovula`

### Step 4: Verify Deployment
- [ ] Deployment completed successfully
- [ ] Copy backend URL: `https://your-app.railway.app`
- [ ] Test health endpoint: `curl https://your-app.railway.app/health`
- [ ] Response shows: `{"status": "healthy", "model_type": "groq_api"}`

---

## 🎨 Frontend Deployment - Vercel (3 minutes)

### Step 1: Create Project
- [ ] Go to Vercel.com
- [ ] Click "Add New" → "Project"
- [ ] Import your GitHub repository
- [ ] Configure project settings

### Step 2: Configure Build Settings
- [ ] **Root Directory**: `src/frontend`
- [ ] **Framework Preset**: Create React App (auto-detected)
- [ ] **Build Command**: `npm run build` (auto-filled)
- [ ] **Output Directory**: `build` (auto-filled)

### Step 3: Add Environment Variable
- [ ] Click "Environment Variables"
- [ ] Add variable:
  - **Name**: `REACT_APP_API_URL`
  - **Value**: `https://your-app.railway.app` (your Railway URL)
- [ ] Apply to: Production, Preview, Development

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Copy frontend URL: `https://your-app.vercel.app`

---

## 🔄 Final Configuration (1 minute)

### Update Backend with Frontend URL
- [ ] Go back to Railway
- [ ] Backend Service → Variables
- [ ] Add/Update: `APP_URL` = `https://your-app.vercel.app`
- [ ] Wait for automatic redeploy

---

## ✅ Testing (5 minutes)

### Backend Tests
- [ ] Health check: `curl https://your-backend.railway.app/health`
- [ ] API docs accessible: `https://your-backend.railway.app/docs`
- [ ] Database connected (check logs)

### Frontend Tests
- [ ] Homepage loads: `https://your-app.vercel.app`
- [ ] No console errors
- [ ] Assets loading correctly

### End-to-End Tests
- [ ] Click "Sign Up"
- [ ] Fill registration form
- [ ] Submit registration
- [ ] Check email for OTP code
- [ ] Enter OTP code
- [ ] Verify email successful
- [ ] Login with credentials
- [ ] Dashboard loads
- [ ] Add a daily log
- [ ] Log saved successfully
- [ ] Open AI Chat
- [ ] Send a message
- [ ] AI responds correctly
- [ ] Toggle Urdu translation
- [ ] Urdu response received
- [ ] Check cycle tracker
- [ ] View profile
- [ ] Update profile
- [ ] Logout
- [ ] Login again

---

## 🎉 Success Criteria

All of these should be ✅:
- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Database connected
- [ ] User registration works
- [ ] Email OTP received and verified
- [ ] Login successful
- [ ] Daily logs working
- [ ] AI chat responding
- [ ] Urdu translation working
- [ ] All pages accessible
- [ ] No console errors
- [ ] No API errors

---

## 🐛 Troubleshooting

### If Backend Health Check Fails
1. Check Railway logs: Dashboard → Service → Deployments → View Logs
2. Verify all environment variables are set
3. Check DATABASE_URL format
4. Verify Groq API key is valid

### If Frontend Shows Errors
1. Check Vercel logs: Dashboard → Project → Deployments → View Logs
2. Verify REACT_APP_API_URL is correct
3. Check browser console for errors
4. Verify backend is accessible

### If OTP Email Not Received
1. Check spam folder
2. Verify SMTP credentials
3. Check Railway logs for email errors
4. Verify Gmail App Password (not account password)
5. Ensure 2FA is enabled on Gmail

### If AI Chat Not Working
1. Verify GROQ_API_KEY is set
2. Check MODEL_TYPE is `groq_api`
3. Test Groq API directly: https://console.groq.com/
4. Check Railway logs for API errors
5. Verify rate limits not exceeded (30 req/min)

---

## 📊 Monitoring

### Daily Checks
- [ ] Backend health: `curl https://your-backend.railway.app/health`
- [ ] Frontend accessible
- [ ] No error logs

### Weekly Checks
- [ ] Railway usage (within $5 credit)
- [ ] Groq API usage (within free tier)
- [ ] Database size (within 1GB)
- [ ] User feedback

### Monthly Checks
- [ ] Update dependencies
- [ ] Review security
- [ ] Backup database
- [ ] Performance optimization

---

## 🔄 Updating Your App

### Code Updates
1. Make changes locally
2. Test locally
3. Commit to GitHub: `git commit -am "Update message"`
4. Push to GitHub: `git push origin main`
5. Railway auto-deploys backend
6. Vercel auto-deploys frontend
7. Verify changes in production

### Environment Variable Updates
1. Railway: Dashboard → Service → Variables → Edit
2. Vercel: Dashboard → Project → Settings → Environment Variables
3. Redeploy if needed

---

## 📞 Support

### Documentation
- [ ] Read DEPLOYMENT_GUIDE.md for details
- [ ] Read QUICK_DEPLOY.md for quick start
- [ ] Check .env.example for configuration

### Help Resources
- Railway Docs: https://docs.railway.app/
- Vercel Docs: https://vercel.com/docs
- Groq Docs: https://console.groq.com/docs

### Community
- Railway Discord: https://discord.gg/railway
- Vercel Discord: https://discord.gg/vercel
- GitHub Issues: Open issue in your repo

---

## 🎊 Congratulations!

If all items are checked, your Ovula PCOS tracking app is:
- ✅ **Live** and accessible worldwide
- ✅ **Secure** with HTTPS/SSL
- ✅ **Scalable** to handle many users
- ✅ **Free** to run (within limits)
- ✅ **Fast** with CDN delivery
- ✅ **Reliable** with automatic backups

**Share your app and start helping people!** 💜

---

## 📝 Deployment Info

Record your deployment details:

```
Backend URL: https://_____________________.railway.app
Frontend URL: https://_____________________.vercel.app
Deployment Date: ___________________
Groq Model: llama-3.1-70b-versatile
Database: PostgreSQL (Railway)
```

**Keep this information safe!** 🔐
