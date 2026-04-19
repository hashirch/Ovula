# 🚀 DEPLOY NOW - Quick Reference

## ⚡ 5-Step Deployment (10 minutes)

---

## 📋 STEP 1: Commit & Push (1 min)

```bash
git add .
git commit -m "Configure for cloud deployment with Groq API"
git push origin main
```

---

## 🚂 STEP 2: Railway - Backend (3 min)

### 2.1 Create Project
1. Open: **https://railway.app/**
2. Login with GitHub
3. New Project → Deploy from GitHub repo
4. Select your repository

### 2.2 Add Database
1. Click "New" → Database → PostgreSQL
2. Wait for provisioning

### 2.3 Add Environment Variables
Click backend service → Variables → Add these:

```env
SECRET_KEY=your-secret-key-here-change-in-production-min-32-chars
MODEL_TYPE=groq_api
GROQ_API_KEY=gsk_KZETV27fX0GssUHIm3EXWGdyb3FYBZWvzDebyDEUWqmEOwys3lOWapi
GROQ_MODEL=llama-3.1-70b-versatile
DATABASE_URL=${{Postgres.DATABASE_URL}}
SMTP_USERNAME=ovula2025@gmail.com
SMTP_PASSWORD=hnqzfgwfzfxsuton
FROM_EMAIL=ovula2025@gmail.com
APP_NAME=Ovula
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OTP_ENABLED=true
EMAIL_BACKEND=smtp
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

### 2.4 Copy Backend URL
📝 **Your Backend URL**: `https://______________.railway.app`

---

## 🎨 STEP 3: Vercel - Frontend (3 min)

### 3.1 Create Project
1. Open: **https://vercel.com/**
2. Login with GitHub
3. Add New → Project
4. Import your repository

### 3.2 Configure
- **Root Directory**: `src/frontend`
- **Framework**: Create React App (auto)
- **Build Command**: `npm run build` (auto)
- **Output Directory**: `build` (auto)

### 3.3 Add Environment Variable
- **Name**: `REACT_APP_API_URL`
- **Value**: `https://your-backend.railway.app` ← (from Step 2.4)
- **Apply to**: All (Production, Preview, Development)

### 3.4 Deploy
Click "Deploy" and wait 2-3 minutes

### 3.5 Copy Frontend URL
📝 **Your Frontend URL**: `https://______________.vercel.app`

---

## 🔄 STEP 4: Update Backend (1 min)

1. Go back to Railway
2. Backend service → Variables
3. Add: `APP_URL` = `https://your-app.vercel.app` ← (from Step 3.5)
4. Auto-redeploys

---

## ✅ STEP 5: Test (2 min)

### Test Backend
```bash
curl https://your-backend.railway.app/health
```
Expected: `{"status": "healthy", "model_type": "groq_api"}`

### Test Frontend
1. Open: `https://your-app.vercel.app`
2. Sign Up → Register
3. Check email for OTP
4. Verify → Login
5. Test AI Chat

---

## 🎉 SUCCESS!

Your app is live at:
- **Backend**: https://______________.railway.app
- **Frontend**: https://______________.vercel.app

---

## 🐛 Quick Troubleshooting

### Backend won't start?
- Check Railway logs: Service → Deployments → View Logs
- Verify all environment variables are set
- Check DATABASE_URL is `${{Postgres.DATABASE_URL}}`

### Frontend shows errors?
- Check Vercel logs: Project → Deployments → View Logs
- Verify REACT_APP_API_URL matches Railway URL
- Check browser console for errors

### OTP email not received?
- Check spam folder
- Verify SMTP_USERNAME and SMTP_PASSWORD
- Check Railway logs for email errors

### AI chat not working?
- Verify GROQ_API_KEY is set correctly
- Check MODEL_TYPE is `groq_api`
- Check Railway logs for API errors

---

## 📞 Need Help?

- **Railway Docs**: https://docs.railway.app/
- **Vercel Docs**: https://vercel.com/docs
- **Full Guide**: Open DEPLOYMENT_GUIDE.md
- **Checklist**: Open DEPLOY_CHECKLIST.md

---

## 💡 Pro Tips

1. **Generate Strong SECRET_KEY**:
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **View Railway Logs**:
   ```bash
   railway logs
   ```

3. **Redeploy**:
   - Railway: Push to GitHub (auto-deploys)
   - Vercel: Push to GitHub (auto-deploys)

4. **Custom Domain** (Optional):
   - Railway: Settings → Domains
   - Vercel: Settings → Domains

---

## ✅ Deployment Checklist

- [ ] Step 1: Committed and pushed to GitHub
- [ ] Step 2: Backend deployed to Railway
- [ ] Step 2: PostgreSQL database added
- [ ] Step 2: Environment variables configured
- [ ] Step 2: Backend URL copied
- [ ] Step 3: Frontend deployed to Vercel
- [ ] Step 3: REACT_APP_API_URL configured
- [ ] Step 3: Frontend URL copied
- [ ] Step 4: APP_URL added to Railway
- [ ] Step 5: Backend health check passed
- [ ] Step 5: Frontend loads correctly
- [ ] Step 5: Registration works
- [ ] Step 5: OTP email received
- [ ] Step 5: Login successful
- [ ] Step 5: AI chat works

---

<div align="center">

**🚀 Ready? Start with Step 1! 🚀**

**Your app will be live in 10 minutes!**

</div>
