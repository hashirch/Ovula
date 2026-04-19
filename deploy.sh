#!/bin/bash

# Ovula Deployment Helper Script
# This script helps you commit changes and provides deployment links

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║           🚀 OVULA DEPLOYMENT HELPER 🚀                        ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Git status
echo -e "${BLUE}📋 Checking Git status...${NC}"
CHANGED_FILES=$(git status --short | wc -l)
echo -e "${GREEN}✓ Found $CHANGED_FILES changed files${NC}"
echo ""

# Step 2: Commit changes
echo -e "${BLUE}💾 Committing changes...${NC}"
git add .
git commit -m "Configure for cloud deployment with Groq API"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Changes committed successfully${NC}"
else
    echo -e "${YELLOW}⚠ No new changes to commit (already committed)${NC}"
fi
echo ""

# Step 3: Push to GitHub
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Pushed to GitHub successfully${NC}"
else
    echo -e "${YELLOW}⚠ Push failed. Check your Git remote configuration.${NC}"
    echo "   Run: git remote -v"
    echo ""
fi
echo ""

# Step 4: Provide deployment links
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ READY TO DEPLOY!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1. 🚂 Deploy Backend to Railway:"
echo "   → Open: https://railway.app/"
echo "   → Login with GitHub"
echo "   → New Project → Deploy from GitHub repo"
echo "   → Select your repository"
echo "   → Add PostgreSQL database"
echo "   → Configure environment variables (see DEPLOY_NOW.md)"
echo ""
echo "2. 🎨 Deploy Frontend to Vercel:"
echo "   → Open: https://vercel.com/"
echo "   → Login with GitHub"
echo "   → Add New → Project"
echo "   → Import your repository"
echo "   → Set root directory: src/frontend"
echo "   → Add REACT_APP_API_URL environment variable"
echo ""
echo "3. 📚 Full Instructions:"
echo "   → Open: DEPLOY_NOW.md (quick reference)"
echo "   → Open: QUICK_DEPLOY.md (detailed guide)"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}🎉 Your code is ready! Follow the steps above to deploy! 🎉${NC}"
echo ""
