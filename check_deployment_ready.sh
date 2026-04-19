#!/bin/bash

# Deployment Readiness Check Script
# Run this before deploying to verify everything is configured

echo "════════════════════════════════════════════════════════════"
echo "🚀 OVULA DEPLOYMENT READINESS CHECK"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check if .env file exists
echo "📁 Checking configuration files..."
if [ -f "src/backend/.env" ]; then
    echo -e "${GREEN}✅ src/backend/.env exists${NC}"
else
    echo -e "${RED}❌ src/backend/.env not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check if required files exist
FILES=(
    "src/backend/requirements.txt"
    "src/backend/main.py"
    "src/backend/database.py"
    "src/backend/app/services/groq_service.py"
    "src/frontend/package.json"
    "src/frontend/vercel.json"
    "railway-config.json"
    "nixpacks.toml"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file not found${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "🔑 Checking environment variables..."

# Source .env file
if [ -f "src/backend/.env" ]; then
    export $(cat src/backend/.env | grep -v '^#' | xargs)
    
    # Check required variables
    if [ ! -z "$GROQ_API_KEY" ]; then
        echo -e "${GREEN}✅ GROQ_API_KEY is set${NC}"
    else
        echo -e "${RED}❌ GROQ_API_KEY is not set${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ "$MODEL_TYPE" = "groq_api" ]; then
        echo -e "${GREEN}✅ MODEL_TYPE is set to groq_api${NC}"
    else
        echo -e "${YELLOW}⚠️  MODEL_TYPE is '$MODEL_TYPE' (should be 'groq_api' for deployment)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if [ ! -z "$SECRET_KEY" ]; then
        echo -e "${GREEN}✅ SECRET_KEY is set${NC}"
    else
        echo -e "${RED}❌ SECRET_KEY is not set${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ ! -z "$SMTP_USERNAME" ]; then
        echo -e "${GREEN}✅ SMTP_USERNAME is set${NC}"
    else
        echo -e "${YELLOW}⚠️  SMTP_USERNAME is not set (needed for OTP emails)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if [ ! -z "$SMTP_PASSWORD" ]; then
        echo -e "${GREEN}✅ SMTP_PASSWORD is set${NC}"
    else
        echo -e "${YELLOW}⚠️  SMTP_PASSWORD is not set (needed for OTP emails)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""
echo "📦 Checking dependencies..."

# Check if groq is in requirements.txt
if grep -q "groq" src/backend/requirements.txt; then
    echo -e "${GREEN}✅ groq in requirements.txt${NC}"
else
    echo -e "${RED}❌ groq not in requirements.txt${NC}"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "psycopg2-binary" src/backend/requirements.txt; then
    echo -e "${GREEN}✅ psycopg2-binary in requirements.txt${NC}"
else
    echo -e "${RED}❌ psycopg2-binary not in requirements.txt${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "🔍 Checking Git status..."

if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Git repository initialized${NC}"
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
        echo "   Run: git add . && git commit -m 'Prepare for deployment'"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✅ All changes committed${NC}"
    fi
    
    # Check if remote is set
    if git remote -v | grep -q "origin"; then
        echo -e "${GREEN}✅ Git remote 'origin' is set${NC}"
    else
        echo -e "${YELLOW}⚠️  No Git remote set${NC}"
        echo "   Run: git remote add origin <your-github-repo-url>"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Not a Git repository${NC}"
    echo "   Run: git init && git add . && git commit -m 'Initial commit'"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📊 SUMMARY"
echo "════════════════════════════════════════════════════════════"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "🚀 You're ready to deploy!"
    echo ""
    echo "Next steps:"
    echo "  1. Push to GitHub: git push origin main"
    echo "  2. Deploy backend to Railway"
    echo "  3. Deploy frontend to Vercel"
    echo ""
    echo "📚 Read QUICK_DEPLOY.md for detailed instructions"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS WARNING(S) FOUND${NC}"
    echo ""
    echo "You can proceed with deployment, but consider fixing the warnings above."
    echo ""
    echo "📚 Read QUICK_DEPLOY.md for detailed instructions"
    exit 0
else
    echo -e "${RED}❌ $ERRORS ERROR(S) FOUND${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS WARNING(S) FOUND${NC}"
    fi
    echo ""
    echo "Please fix the errors above before deploying."
    echo ""
    echo "📚 Check these files:"
    echo "  - src/backend/.env (environment variables)"
    echo "  - src/backend/requirements.txt (dependencies)"
    echo "  - QUICK_DEPLOY.md (deployment guide)"
    exit 1
fi
