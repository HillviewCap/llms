# LLMS.txt Explorer

A comprehensive explorer for LLMS.txt files from various domains across the web. This project helps developers, researchers, and website owners understand how the LLMS.txt standard is being implemented.

## Project Overview

The LLMS.txt Explorer is an Astro-based web application that collects, analyzes, and displays LLMS.txt files from websites across the internet. LLMS.txt is an emerging standard that helps websites communicate their preferences for AI training and crawling. This project provides insights into how different organizations are approaching AI training permissions and restrictions.

## Features

- Browse and search LLMS.txt files from multiple domains
- Filter by category or domain
- View detailed information about each implementation
- Compare different approaches to AI training permissions
- Responsive design with dark mode support
- SEO optimized with structured data
- Performance optimized with lazy loading and prefetching

## Project Structure

```
astro-llms-explorer/
├── public/                 # Static assets and files
│   ├── _headers            # Netlify/Cloudflare headers configuration
│   ├── .htaccess           # Apache server configuration
│   ├── favicon.svg         # Site favicon
│   ├── og-image.png        # Open Graph image for social sharing
│   ├── robots.txt          # Search engine crawling instructions
│   └── sitemap.xml         # Site structure for search engines
├── src/
│   ├── assets/             # Project assets (images, etc.)
│   ├── components/         # Reusable Astro components
│   │   ├── PerformanceOptimizer.astro  # Performance enhancements
│   │   ├── StructuredData.astro        # SEO structured data
│   │   └── Welcome.astro               # Welcome component
│   ├── data/               # Data files
│   │   └── llms_metadata_enriched.json # Processed LLMS.txt data
│   ├── layouts/            # Page layouts
│   │   └── Layout.astro    # Main site layout
│   ├── pages/              # Astro pages
│   │   ├── 404.astro       # Custom 404 error page
│   │   └── index.astro     # Homepage
│   └── styles/             # Global styles
│       └── global.css      # TailwindCSS imports
├── astro.config.mjs        # Astro configuration
├── package.json            # Project dependencies and scripts
├── tailwind.config.mjs     # TailwindCSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Technologies Used

- **[Astro](https://astro.build/)**: Fast, modern static site generator
- **[TailwindCSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[Cloudflare API](https://developers.cloudflare.com/api/)**: For domain categorization
- **[Brave Search API](https://brave.com/search/api/)**: For discovering LLMS.txt files
- **[GitHub API](https://docs.github.com/en/rest)**: For finding LLMS.txt implementations

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/example/llms-explorer.git
   cd llms-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:4321`

## Data Source

The LLMS.txt data displayed in this explorer (`src/data/llms_metadata_enriched.json`) is automatically acquired, processed, and updated by a separate backend process. This process runs in the [llms-backend](<https://github.com/your-username/llms-backend>) repository (replace with actual link if available).

The backend uses Python scripts and various APIs (Brave Search, GitHub, Cloudflare) to gather and enrich the data. A GitHub Actions workflow in the backend repository automatically commits the updated `llms_metadata_enriched.json` file to this frontend repository's `src/data/` directory periodically.

Therefore, manual data updates are no longer required within this repository. The data is kept current by the automated backend workflow.

## Deployment Guide

### Building for Production

1. Update the site URL in `astro.config.mjs`:
   ```javascript
   site: 'https://your-domain.com',
   ```

2. Build the site:
   ```bash
   npm run build
   ```

3. The built files will be in the `dist` directory.

### Deployment Options

#### Netlify Deployment

1. Connect your GitHub repository to Netlify.
2. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set environment variables if needed.
4. Deploy the site.

The site includes a `_headers` file that will automatically configure caching and security headers on Netlify.

#### Vercel Deployment

1. Connect your GitHub repository to Vercel.
2. Configure the build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Output directory: `dist`
3. Set environment variables if needed.
4. Deploy the site.

#### Cloudflare Pages Deployment

1. Connect your GitHub repository to Cloudflare Pages.
2. Configure the build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Set environment variables if needed.
4. Deploy the site.

The site includes a `_headers` file that will automatically configure caching and security headers on Cloudflare Pages.

#### GitHub Pages Deployment

1. Update the `astro.config.mjs` file:
   ```javascript
   import { defineConfig } from 'astro/config';
   
   export default defineConfig({
     site: 'https://username.github.io',
     base: '/repository-name',
     // other configuration...
   });
   ```

2. Build the site:
   ```bash
   npm run build
   ```

3. Deploy using GitHub Actions by creating a `.github/workflows/deploy.yml` file:
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

#### Traditional Web Server Deployment

1. Upload the contents of the `dist` directory to your web server.
2. Ensure your server is configured to serve the `.htaccess` file for proper caching and security headers.
3. Configure your server to redirect all requests to non-existent files to `/404.html`.

### Custom Domain Setup

1. Update the `site` property in `astro.config.mjs` to your production domain:
   ```javascript
   site: 'https://your-domain.com',
   ```

2. If using a CDN or hosting provider:
   - Configure your DNS settings to point to your hosting provider
   - Set up SSL certificates for HTTPS
   - Configure any additional domain settings according to your provider's documentation

3. For Netlify, Vercel, or Cloudflare Pages:
   - Add your custom domain in the provider's dashboard
   - Follow the provider's instructions to verify domain ownership
   - Configure DNS settings as instructed

## Maintenance Guide

### Updating the Data

The LLMS.txt data (`src/data/llms_metadata_enriched.json`) is updated automatically by a backend process running in a separate repository. A GitHub Actions workflow commits the latest data directly to this repository.

No manual steps are needed here to update the data. If the site is deployed on a platform like Cloudflare Pages, Vercel, or Netlify with continuous deployment enabled, the site will automatically rebuild and redeploy when the data file is updated by the backend workflow.

### Making Site Changes

#### Modifying the Design

1. Edit the TailwindCSS classes in the Astro components to change the styling.
2. For global styles, modify `src/styles/global.css`.
3. For layout changes, edit `src/layouts/Layout.astro`.
4. For component changes, edit files in the `src/components/` directory.

#### Adding New Pages

1. Create a new `.astro` file in the `src/pages/` directory.
2. Use the `Layout` component to maintain consistent styling.
3. Update the sitemap.xml file to include the new page.

#### Updating SEO

1. Modify the meta tags in `src/layouts/Layout.astro`.
2. Update the structured data in `src/components/StructuredData.astro`.
3. Update the `robots.txt` and `sitemap.xml` files in the `public/` directory.

### Troubleshooting

#### Build Errors

- Check the Node.js version (should be 18.x or higher)
- Ensure all dependencies are installed: `npm install`
- Clear the cache: `npm run clean` or remove the `.astro` directory
- Check for TypeScript errors: `npx tsc --noEmit`

#### Deployment Issues

- Verify the build output directory is correct (`dist`)
- Check environment variables are properly set
- Ensure the site URL in `astro.config.mjs` is correct
- Verify DNS settings for custom domains

#### Performance Issues

- Check the Network tab in browser DevTools for slow-loading resources
- Optimize images using WebP format
- Ensure lazy loading is working correctly
- Verify caching headers are being applied

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
