#!/bin/bash

# Push to GitHub Script
# This script commits and pushes your code to GitHub

echo "════════════════════════════════════════════════════════════════"
echo "📤 PUSHING YOUR CODE TO GITHUB"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Add all files
echo -e "${BLUE}📁 Adding files...${NC}"
git add .
echo -e "${GREEN}✓ Files added${NC}"
echo ""

# Step 2: Commit
echo -e "${BLUE}💾 Committing changes...${NC}"
git commit -m "Configure for cloud deployment with Groq API"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Changes committed${NC}"
elif [ $? -eq 1 ]; then
    echo -e "${YELLOW}⚠ No new changes to commit (already committed)${NC}"
else
    echo -e "${RED}✗ Commit failed${NC}"
    exit 1
fi
echo ""

# Step 3: Push to GitHub
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo -e "${GREEN}✅ SUCCESS! Code pushed to GitHub!${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. ✓ Verify on GitHub:"
    echo "   → https://github.com/hashirch/ovula"
    echo ""
    echo "2. Go back to Railway:"
    echo "   → Click 'Refresh' button"
    echo "   → Your repository will now appear"
    echo "   → Select it and continue deployment"
    echo ""
    echo "3. Follow DEPLOY_NOW.md for the rest of the deployment"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
else
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo -e "${RED}✗ PUSH FAILED${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Common fixes:"
    echo ""
    echo "1. Permission denied?"
    echo "   → Set up GitHub authentication"
    echo "   → See: PUSH_TO_GITHUB.md"
    echo ""
    echo "2. Updates rejected?"
    echo "   → Run: git pull origin main --rebase"
    echo "   → Then run this script again"
    echo ""
    echo "3. Wrong branch?"
    echo "   → Try: git push origin master"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    exit 1
fi
