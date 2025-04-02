# LLMS.txt Explorer Deployment Guide

This document provides detailed instructions for deploying the LLMS.txt Explorer project to various platforms and environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Building for Production](#building-for-production)
- [Deployment Options](#deployment-options)
  - [Netlify](#netlify)
  - [Vercel](#vercel)
  - [Cloudflare Pages](#cloudflare-pages)
  - [GitHub Pages](#github-pages)
  - [Traditional Web Server](#traditional-web-server)
- [Custom Domain Setup](#custom-domain-setup)
- [Environment Variables](#environment-variables)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18.x or higher installed
- All dependencies installed: `npm install`
- Updated the site URL in `astro.config.mjs` to your production domain
- Built the project for production: `npm run build`

## Building for Production

1. Update the site URL in `astro.config.mjs`:
   ```javascript
   site: 'https://your-domain.com',
   ```

2. Build the site:
   ```bash
   npm run build
   ```

3. The built files will be in the `dist` directory.

## Deployment Options

### Netlify

Netlify is a popular platform for deploying static sites with continuous deployment.

#### Automatic Deployment with Git

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Sign up or log in to [Netlify](https://www.netlify.com/).
3. Click "New site from Git" and select your repository.
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site".

#### Manual Deployment

1. Build your site locally: `npm run build`
2. Install the Netlify CLI: `npm install -g netlify-cli`
3. Log in to Netlify: `netlify login`
4. Deploy the site: `netlify deploy --prod --dir=dist`

#### Environment Variables

Set environment variables in the Netlify dashboard under Site settings > Build & deploy > Environment.

#### Custom Domain

1. In the Netlify dashboard, go to Site settings > Domain management.
2. Click "Add custom domain" and follow the instructions.
3. Netlify will guide you through the DNS configuration process.

### Vercel

Vercel is optimized for frontend frameworks and provides a seamless deployment experience.

#### Automatic Deployment with Git

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Sign up or log in to [Vercel](https://vercel.com/).
3. Click "New Project" and import your repository.
4. Configure the build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Output directory: `dist`
5. Click "Deploy".

#### Manual Deployment

1. Build your site locally: `npm run build`
2. Install the Vercel CLI: `npm install -g vercel`
3. Log in to Vercel: `vercel login`
4. Deploy the site: `vercel --prod`

#### Environment Variables

Set environment variables in the Vercel dashboard under Project settings > Environment Variables.

#### Custom Domain

1. In the Vercel dashboard, go to Project settings > Domains.
2. Add your domain and follow the instructions for DNS configuration.

### Cloudflare Pages

Cloudflare Pages offers fast, secure hosting with integrated CDN capabilities.

#### Automatic Deployment with Git

1. Push your code to a Git repository (GitHub or GitLab).
2. Sign up or log in to [Cloudflare](https://pages.cloudflare.com/).
3. Create a new project and connect your repository.
4. Configure the build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Click "Save and Deploy".

#### Environment Variables

Set environment variables in the Cloudflare dashboard under Pages > Your project > Settings > Environment variables.

#### Custom Domain

1. In the Cloudflare dashboard, go to Pages > Your project > Custom domains.
2. Add your domain and follow the instructions.
3. If your domain is already on Cloudflare, it will be automatically configured.

### GitHub Pages

GitHub Pages is a free hosting service provided by GitHub.

#### Configuration

1. Update the `astro.config.mjs` file:
   ```javascript
   import { defineConfig } from 'astro/config';
   
   export default defineConfig({
     site: 'https://username.github.io',
     base: '/repository-name', // Remove this line if deploying to a custom domain
     // other configuration...
   });
   ```

#### Deployment with GitHub Actions

1. Create a `.github/workflows/deploy.yml` file:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]
     workflow_dispatch:

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: 18
         - name: Install dependencies
           run: npm ci
         - name: Build
           run: npm run build
         - name: Deploy
           uses: JamesIves/github-pages-deploy-action@v4
           with:
             folder: dist
   ```

2. Push this file to your repository.
3. GitHub Actions will automatically build and deploy your site.

#### Custom Domain

1. Add a file named `CNAME` to the `public/` directory with your domain name:
   ```
   your-domain.com
   ```

2. Configure your DNS settings to point to GitHub Pages:
   - Add an A record pointing to GitHub Pages IP addresses:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - Or add a CNAME record pointing to `username.github.io`

3. In your repository settings, go to Pages > Custom domain and enter your domain.

### Traditional Web Server

For deployment to traditional web servers like Apache or Nginx.

#### Apache Server

1. Upload the contents of the `dist` directory to your web server.
2. Ensure your server is configured to serve the `.htaccess` file:
   ```apache
   # In your server configuration
   <Directory /path/to/your/site>
       AllowOverride All
   </Directory>
   ```

3. The included `.htaccess` file contains:
   - Redirects for www to non-www
   - HTTP to HTTPS redirects
   - 404 error handling
   - Security headers
   - Caching rules
   - Compression settings

#### Nginx Server

1. Upload the contents of the `dist` directory to your web server.
2. Configure your Nginx server block:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       root /path/to/dist;
       index index.html;

       # Security headers
       add_header X-Content-Type-Options "nosniff";
       add_header X-XSS-Protection "1; mode=block";
       add_header X-Frame-Options "DENY";
       add_header Referrer-Policy "strict-origin-when-cross-origin";
       add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
       add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';";

       # Caching rules
       location ~* \.(js|css)$ {
           expires 7d;
           add_header Cache-Control "public, max-age=604800, stale-while-revalidate=86400";
       }

       location ~* \.(ico|jpg|jpeg|png|gif|svg|webp)$ {
           expires 7d;
           add_header Cache-Control "public, max-age=604800, stale-while-revalidate=86400";
       }

       location ~* \.(woff|woff2|ttf|otf|eot)$ {
           expires 365d;
           add_header Cache-Control "public, max-age=31536000, immutable";
       }

       # Handle 404 errors
       error_page 404 /404.html;

       # Handle all routes
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## Custom Domain Setup

### DNS Configuration

1. Log in to your domain registrar's dashboard.
2. Navigate to the DNS settings for your domain.
3. Configure the DNS records based on your deployment platform:
   - For most platforms: Add an A record pointing to your provider's IP address
   - For GitHub Pages: Add A records pointing to GitHub's IP addresses
   - For subdomain deployment: Add a CNAME record pointing to your provider's domain

### SSL/TLS Certificates

1. Most deployment platforms (Netlify, Vercel, Cloudflare) provide automatic SSL certificates.
2. For traditional web servers:
   - Use [Let's Encrypt](https://letsencrypt.org/) for free SSL certificates
   - Install [Certbot](https://certbot.eff.org/) to automate certificate renewal

### Redirects

Configure redirects to ensure users are directed to the correct URL:

1. www to non-www (or vice versa)
2. HTTP to HTTPS
3. Old paths to new paths (if applicable)

These redirects are already configured in the `.htaccess` file for Apache servers.

## Environment Variables

If your site requires environment variables (e.g., for API keys), configure them on your deployment platform:

- Netlify: Site settings > Build & deploy > Environment
- Vercel: Project settings > Environment Variables
- Cloudflare Pages: Pages > Your project > Settings > Environment variables
- GitHub Pages: Use GitHub Secrets for GitHub Actions

For local development, use a `.env` file (not committed to Git):

```
PUBLIC_API_URL=https://api.example.com
```

## Performance Optimization

The LLMS.txt Explorer includes several performance optimizations:

1. **Asset Compression**: CSS and JavaScript files are minified and compressed.
2. **Image Optimization**: Images are optimized and served in modern formats.
3. **Lazy Loading**: Images are loaded only when they enter the viewport.
4. **Link Prefetching**: Links are prefetched when hovered to improve perceived performance.
5. **Caching Headers**: Appropriate caching headers are set for different asset types.

To verify these optimizations:

1. Use [Google PageSpeed Insights](https://pagespeed.web.dev/) to analyze your deployed site.
2. Check the Network tab in browser DevTools to verify caching headers.
3. Use Lighthouse in Chrome DevTools for a comprehensive performance audit.

## Troubleshooting

### Common Issues

#### Build Failures

- **Issue**: Build fails with Node.js version errors
  - **Solution**: Ensure you're using Node.js 18.x or higher

- **Issue**: Build fails with dependency errors
  - **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install`

#### Deployment Failures

- **Issue**: Deployment fails with 404 errors
  - **Solution**: Verify the build output directory is set correctly (`dist`)

- **Issue**: Custom domain not working
  - **Solution**: Check DNS propagation (can take up to 48 hours) and verify DNS records

#### Runtime Issues

- **Issue**: Styles or scripts not loading
  - **Solution**: Check the browser console for errors and verify paths in the HTML

- **Issue**: Images not displaying
  - **Solution**: Verify image paths and check if the images were included in the build

- **Issue**: API requests failing
  - **Solution**: Check CORS settings and ensure environment variables are set correctly

### Getting Help

If you encounter issues not covered here:

1. Check the [Astro documentation](https://docs.astro.build/)
2. Search for similar issues on the [Astro GitHub repository](https://github.com/withastro/astro/issues)
3. Ask for help on the [Astro Discord server](https://astro.build/chat)
4. Open an issue on the LLMS.txt Explorer repository