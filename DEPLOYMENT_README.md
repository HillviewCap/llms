# LLMS.txt Explorer Deployment Instructions

This README provides quick instructions for deploying the LLMS.txt Explorer to Cloudflare Pages and avoiding common Node.js compatibility issues.

## Quick Start

1. **Check for compatibility issues**:

   ```bash
   npm run check-compatibility
   ```

2. **Test locally before deploying**:

   ```bash
   npm run build
   npx wrangler pages dev dist
   ```

3. Use the deployment script to commit and push changes:

   ```bash
   ./deploy.sh
   ```

4. Follow the prompts in the script to complete the deployment process.

5. After deployment is complete, verify that the site is working correctly by visiting your site.

## Detailed Documentation

For more detailed instructions, verification steps, and troubleshooting information, please refer to:

- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Comprehensive guide for deploying and verifying the fixes
- [Local Testing Guide](docs/LOCAL_TESTING.md) - Step-by-step instructions for testing locally before deployment
- [Cloudflare Deployment Documentation](docs/CLOUDFLARE_DEPLOYMENT.md) - General information about Cloudflare Pages deployment

## Cloudflare Compatibility

Cloudflare Pages runs on Cloudflare Workers, which uses a V8 isolate environment that doesn't support Node.js-specific modules. To ensure compatibility:

1. **Use direct imports for data files** instead of reading them from the filesystem at runtime

   ```javascript
   // ✅ This WILL work on Cloudflare
   import data from "../data/data.json";

   // ❌ This will NOT work on Cloudflare
   import fs from "fs";
   const data = JSON.parse(fs.readFileSync("data.json"));
   ```

2. **Avoid Node.js-specific modules** entirely in code that will run on Cloudflare

   - Don't use `fs`, `path`, or any imports using the `node:` prefix
   - Don't use `process.env` (use `import.meta.env` instead)
   - Don't use `__dirname` or `__filename`

3. **Configure KV namespaces correctly** for Astro session support

   - Ensure your `wrangler.toml` has the correct KV namespace binding
   - Configure the binding in the Cloudflare Dashboard

4. **Set proper security headers** in the `public/_headers` file

## Final Deployment Checklist

Before deploying to Cloudflare, ensure you've completed the following steps:

1. **Compatibility Check**:

   - Run `node check-cloudflare-compatibility.js` to verify no Node.js-specific code will cause issues
   - Fix any identified compatibility issues

2. **Configuration Verification**:

   - Confirm `wrangler.toml` includes the required compatibility settings:
     ```toml
     compatibility_date = "2024-09-23"
     compatibility_flags = ["nodejs_compat"]
     ```
   - Verify KV namespace bindings are correctly configured
   - Check that security headers are properly set in `public/_headers`

3. **Local Testing**:

   - Build the project with `npm run build`
   - Test locally with `npx wrangler pages dev dist`
   - Verify all functionality works as expected in the Wrangler environment

4. **Deployment**:
   - Use `./deploy.sh` to deploy changes
   - Monitor the deployment in the Cloudflare Dashboard
   - Wait for the deployment to complete (usually 1-3 minutes)

## Verification Steps

After deployment, verify the fix by:

1. Visiting the site at [https://llms-text.ai](https://llms-text.ai)
2. Checking that pages load without errors
3. Verifying the headers are correctly applied using browser DevTools:
   - Open DevTools (F12 or Right-click > Inspect)
   - Go to the Network tab
   - Reload the page
   - Click on the main document request
   - Check the Response Headers section for the security headers
4. Testing all critical functionality:
   - Navigation between pages
   - Search functionality
   - Any interactive elements
   - API endpoints if applicable

## Need Help?

If you encounter any issues during deployment or verification, refer to the troubleshooting section in the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).
