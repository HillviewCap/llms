# Testing Cloudflare Deployments Locally

This guide provides step-by-step instructions for testing your Astro application locally in an environment that simulates Cloudflare Pages before deploying to production.

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Wrangler CLI (Cloudflare's command-line tool)

## Step 1: Run the Compatibility Check

Before testing locally, run the compatibility check script to identify any Node.js-specific modules that might cause issues:

```bash
npm run check-compatibility
```

This script will scan your project for:

- Node.js prefixed imports (`import ... from 'node:...'`)
- Node.js filesystem module usage (`fs`)
- Node.js path module usage (`path`)
- Other Node.js-specific APIs that aren't compatible with Cloudflare

If any issues are found, fix them before proceeding to the next step.

## Step 2: Install Wrangler CLI

If you haven't already installed Wrangler, you can do so globally:

```bash
npm install -g wrangler
```

Or use npx to run it without installing:

```bash
npx wrangler
```

## Step 3: Build Your Project

Build your Astro project to generate the static files:

```bash
npm run build
```

This will create a `dist` directory with your built application.

## Step 4: Test with Wrangler

Run your application using Wrangler's Pages development mode:

```bash
wrangler pages dev dist
```

This command will:

- Start a local server that simulates the Cloudflare Pages environment
- Apply your `wrangler.toml` configuration
- Connect to your KV namespaces if configured

## Step 5: Test Node.js Module Compatibility

When testing locally, pay special attention to:

1. **Data Loading**: Ensure all data is loaded via direct imports rather than filesystem operations
2. **API Routes**: Test all API routes to ensure they don't use Node.js-specific modules
3. **Environment Variables**: Verify that environment variables are accessed correctly
4. **Session Support**: If your application uses sessions, test that functionality

## Step 6: Testing for Common Issues

### Test JSON Imports

If your application imports JSON data, verify that it works correctly:

1. Navigate to pages that display the imported data
2. Check the browser console for any errors
3. Verify that the data is displayed correctly

### Test API Routes

If your application has API routes:

1. Make requests to each API endpoint
2. Check the responses for correctness
3. Verify that no Node.js-specific errors occur

### Test Session Support

If your application uses Astro's session support:

1. Test login/logout functionality if applicable
2. Verify that session data persists between page loads
3. Check that the KV namespace binding is working correctly

## Step 7: Debugging Issues

If you encounter issues during local testing:

### Check for Node.js Module Usage

Search your codebase for Node.js-specific imports:

```bash
grep -r "import.*from 'node:" .
grep -r "import.*from 'fs'" .
grep -r "import.*from 'path'" .
grep -r "require('fs')" .
grep -r "require('path')" .
```

### Check Wrangler Logs

Wrangler will output logs that can help identify issues:

```bash
wrangler pages dev dist --log-level debug
```

### Test with Minimal Configuration

If you're having trouble identifying the issue, try testing with a minimal configuration:

1. Create a simple test page that doesn't import any data
2. Test it with Wrangler
3. Gradually add complexity until you identify the issue

## Step 8: Preparing for Production Deployment

Once your application works correctly in the local Wrangler environment:

1. Commit your changes to version control
2. Push to your repository to trigger a Cloudflare Pages deployment
3. Monitor the deployment in the Cloudflare Dashboard
4. Verify the production deployment using the steps in the main Deployment Guide

## Common Cloudflare Compatibility Issues

### 1. Node.js Built-in Modules

Cloudflare Workers don't support Node.js built-in modules like:

- `fs` (file system)
- `path` (path manipulation)
- `crypto` (some features)
- `http`/`https` (use `fetch` instead)

### 2. Native Node.js APIs

Avoid using:

- `process.env` (use `import.meta.env` instead)
- `__dirname` or `__filename`
- `Buffer` (use `ArrayBuffer` or `Uint8Array` instead)

### 3. Runtime-specific APIs

Some browser APIs are not available in the Cloudflare Workers environment:

- `localStorage`
- `sessionStorage`
- `window` (in some contexts)
- `document` (in some contexts)

## Additional Resources

- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Cloudflare Workers Runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/)
- [Astro Cloudflare Adapter Documentation](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
