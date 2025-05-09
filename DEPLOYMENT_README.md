# LLMS.txt Explorer Deployment Instructions

This README provides quick instructions for deploying the fixes to resolve the 500 error on Cloudflare Pages.

## Quick Start

1. Use the deployment script to commit and push changes:

   ```bash
   ./deploy.sh
   ```

2. Follow the prompts in the script to complete the deployment process.

3. After deployment is complete, verify that the 500 error is resolved by visiting your site.

## Detailed Documentation

For more detailed instructions, verification steps, and troubleshooting information, please refer to:

- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Comprehensive guide for deploying and verifying the fixes
- [Cloudflare Deployment Documentation](docs/CLOUDFLARE_DEPLOYMENT.md) - General information about Cloudflare Pages deployment

## What Was Fixed

The 500 error was resolved by:

1. Updating the `public/_headers` file with proper security headers and caching directives
2. Configuring the `wrangler.toml` file with the correct KV namespace binding for Astro sessions

These changes ensure that:

- The security headers are properly applied to all pages
- The Cloudflare KV namespace is correctly bound to the SESSION variable
- The Astro session functionality works correctly with the Cloudflare adapter

## Verification Steps

After deployment, verify the fix by:

1. Visiting the site at [https://llms-text.ai](https://llms-text.ai)
2. Checking that pages load without 500 errors
3. Verifying the headers are correctly applied using browser DevTools:
   - Open DevTools (F12 or Right-click > Inspect)
   - Go to the Network tab
   - Reload the page
   - Click on the main document request
   - Check the Response Headers section for the security headers

## Need Help?

If you encounter any issues during deployment or verification, refer to the troubleshooting section in the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).
