#!/bin/bash
# LLMS.txt Explorer Deployment Script
# This script commits and pushes changes to GitHub, which will trigger a Cloudflare Pages deployment

# Set colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== LLMS.txt Explorer Deployment Script ===${NC}"
echo -e "${YELLOW}This script will commit and push the fixed files to GitHub, triggering a Cloudflare deployment.${NC}"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed. Please install git and try again.${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo -e "${RED}Error: Not in a git repository. Please run this script from the root of your git repository.${NC}"
    exit 1
fi

# Check for uncommitted changes
echo -e "${YELLOW}Checking for uncommitted changes...${NC}"
if [[ -n $(git status -s) ]]; then
    echo -e "${GREEN}Found uncommitted changes.${NC}"
    
    # Show status
    echo -e "${YELLOW}Current git status:${NC}"
    git status -s
    echo ""
    
    # Add the fixed files
    echo -e "${YELLOW}Adding fixed files to git...${NC}"
    git add public/_headers wrangler.toml src/pages/index.astro
    echo -e "${GREEN}Files added.${NC}"
    echo ""
    
    # Commit the changes
    echo -e "${YELLOW}Committing changes...${NC}"
    git commit -m "Fix: Update headers, wrangler.toml configuration, and index.astro to resolve Cloudflare deployment errors"
    echo -e "${GREEN}Changes committed.${NC}"
    echo ""
    
    # Push to GitHub
    echo -e "${YELLOW}Pushing changes to GitHub...${NC}"
    echo -e "${YELLOW}This will trigger a Cloudflare Pages deployment.${NC}"
    read -p "Continue with push? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push
        PUSH_STATUS=$?
        if [ $PUSH_STATUS -eq 0 ]; then
            echo -e "${GREEN}Changes pushed successfully!${NC}"
            echo ""
            echo -e "${YELLOW}Deployment has been triggered on Cloudflare Pages.${NC}"
            echo -e "${YELLOW}You can monitor the deployment at: https://dash.cloudflare.com/pages${NC}"
            echo ""
            echo -e "${YELLOW}=== Verification Steps ===${NC}"
            echo -e "1. Wait for the deployment to complete (usually 1-3 minutes)"
            echo -e "2. Visit your site at https://llms-text.ai"
            echo -e "3. Check that the 500 error is resolved"
            echo -e "4. Verify the headers are correctly applied using browser DevTools:"
            echo -e "   - Open DevTools (F12 or Right-click > Inspect)"
            echo -e "   - Go to the Network tab"
            echo -e "   - Reload the page"
            echo -e "   - Click on the main document request"
            echo -e "   - Check the Response Headers section for the security headers"
            echo ""
            echo -e "${GREEN}Deployment process initiated successfully!${NC}"
        else
            echo -e "${RED}Error: Failed to push changes to GitHub. Please check your network connection and repository permissions.${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Push cancelled. Changes are committed but not pushed.${NC}"
        exit 0
    fi
else
    echo -e "${YELLOW}No changes detected in the working directory.${NC}"
    echo -e "${YELLOW}Have you already committed the changes to public/_headers, wrangler.toml, and src/pages/index.astro?${NC}"
    read -p "Would you like to push any existing commits? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push
        PUSH_STATUS=$?
        if [ $PUSH_STATUS -eq 0 ]; then
            echo -e "${GREEN}Existing commits pushed successfully!${NC}"
            echo ""
            echo -e "${YELLOW}Deployment has been triggered on Cloudflare Pages.${NC}"
            echo -e "${YELLOW}You can monitor the deployment at: https://dash.cloudflare.com/pages${NC}"
            echo ""
            echo -e "${YELLOW}=== Verification Steps ===${NC}"
            echo -e "1. Wait for the deployment to complete (usually 1-3 minutes)"
            echo -e "2. Visit your site at https://llms-text.ai"
            echo -e "3. Check that the 500 error is resolved"
            echo -e "4. Verify the headers are correctly applied using browser DevTools:"
            echo -e "   - Open DevTools (F12 or Right-click > Inspect)"
            echo -e "   - Go to the Network tab"
            echo -e "   - Reload the page"
            echo -e "   - Click on the main document request"
            echo -e "   - Check the Response Headers section for the security headers"
            echo ""
            echo -e "${GREEN}Deployment process initiated successfully!${NC}"
        else
            echo -e "${RED}Error: Failed to push changes to GitHub. Please check your network connection and repository permissions.${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Push cancelled. No changes were pushed.${NC}"
        exit 0
    fi
fi