# 🚀 Git Upload Guide for Ovula

## Step-by-Step Instructions to Upload to GitHub

### Prerequisites
- GitHub account (create one at https://github.com if you don't have)
- Git installed on your system

### Step 1: Initialize Git Repository

```bash
# Navigate to your project directory
cd ~/Desktop/pcos-tracking-system

# Initialize git
git init

# Check status
git status
```

### Step 2: Create .gitignore (Already exists)

Your `.gitignore` file should exclude:
- `node_modules/`
- `__pycache__/`
- `.env` files
- `*.pyc`
- Database files
- etc.

### Step 3: Add Files to Git

```bash
# Add all files
git add .

# Check what will be committed
git status

# If you see files you don't want, add them to .gitignore and run:
# git reset
# git add .
```

### Step 4: Make First Commit

```bash
# Commit with a message
git commit -m "Initial commit: Ovula - PCOS Tracking System"
```

### Step 5: Create GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon in top right
3. Select **"New repository"**
4. Fill in details:
   - **Repository name**: `ovula` or `pcos-tracking-system`
   - **Description**: "AI-Powered PCOS Tracking & Management System - FYP Project"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README (you already have one)
5. Click **"Create repository"**

### Step 6: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ovula.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 7: Enter GitHub Credentials

When prompted:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your password)

#### How to Create Personal Access Token:
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "Ovula Project"
4. Select scopes: Check "repo" (full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)
7. Use this token as your password when pushing

### Step 8: Verify Upload

1. Go to your GitHub repository URL
2. Refresh the page
3. You should see all your files and the README displayed!

---

## 🔄 Future Updates

After making changes to your code:

```bash
# Check what changed
git status

# Add changed files
git add .

# Commit changes
git commit -m "Description of what you changed"

# Push to GitHub
git push
```

---

## 📝 Common Git Commands

| Command | Description |
|---------|-------------|
| `git status` | Check current status |
| `git add .` | Add all changes |
| `git add filename` | Add specific file |
| `git commit -m "message"` | Commit with message |
| `git push` | Upload to GitHub |
| `git pull` | Download from GitHub |
| `git log` | View commit history |
| `git branch` | List branches |

---

## 🚨 Important Notes

### Files to NEVER commit:
- ✅ Already in `.gitignore`:
  - `.env` files (contains secrets)
  - `node_modules/` (too large)
  - `__pycache__/` (Python cache)
  - `*.pyc` (compiled Python)
  - Database files with real data

### Files to ALWAYS commit:
- ✅ Source code (`.py`, `.js`, `.jsx`)
- ✅ Configuration files (`package.json`, `requirements.txt`)
- ✅ Documentation (`README.md`, guides)
- ✅ Screenshots
- ✅ `.gitignore` itself

---

## 🎯 Quick Start Commands

Copy and paste these commands one by one:

```bash
# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. First commit
git commit -m "Initial commit: Ovula - PCOS Tracking System FYP"

# 4. Add remote (REPLACE YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/ovula.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🆘 Troubleshooting

### Problem: "fatal: not a git repository"
**Solution**: Run `git init` first

### Problem: "remote origin already exists"
**Solution**: 
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/ovula.git
```

### Problem: "failed to push some refs"
**Solution**: 
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Problem: "Permission denied"
**Solution**: Use Personal Access Token instead of password

### Problem: Large files error
**Solution**: Check `.gitignore` and remove large files:
```bash
git rm --cached filename
git commit -m "Remove large file"
```

---

## 📧 Need Help?

Contact your team members or supervisor if you encounter issues!

**Team:**
- Muhammad Hashir: hashir.22pwbcsf9181@student.nu.edu.pk
- Laraib Shahid Abbasi: laraib.22pwbcsf0503@student.nu.edu.pk
- Arooba Gohar: arooba.22pwbcsf9216@student.nu.edu.pk

**Supervisor:** Shahzeb Khan
