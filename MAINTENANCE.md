# LLMS.txt Explorer Maintenance Guide

This document provides detailed instructions for maintaining and updating the LLMS.txt Explorer project.

## Table of Contents

- [Data Management](#data-management)
  - [Updating LLMS.txt Data](#updating-llmstxt-data)
  - [Data Structure](#data-structure)
  - [Troubleshooting Data Issues](#troubleshooting-data-issues)
- [Site Maintenance](#site-maintenance)
  - [Updating Dependencies](#updating-dependencies)
  - [Adding New Features](#adding-new-features)
  - [Modifying the Design](#modifying-the-design)
  - [Adding New Pages](#adding-new-pages)
- [SEO Maintenance](#seo-maintenance)
  - [Updating Meta Tags](#updating-meta-tags)
  - [Structured Data](#structured-data)
  - [Sitemap and Robots.txt](#sitemap-and-robotstxt)
- [Performance Monitoring](#performance-monitoring)
  - [Web Vitals](#web-vitals)
  - [Optimizing Assets](#optimizing-assets)
  - [Caching Strategy](#caching-strategy)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [Debugging Tips](#debugging-tips)

## Data Management

### Updating LLMS.txt Data

The LLMS.txt Explorer relies on the `llms_metadata_enriched.json` file for its data. To update this data:

1. **Run the Data Acquisition Script**:
   ```bash
   python acquire_data.py
   ```
   This script:
   - Searches for LLMS.txt files using Brave Search API
   - Checks GitHub repositories for LLMS.txt files
   - Directly checks top domains for LLMS.txt files
   - Outputs basic metadata to `llms_metadata.json`

2. **Run the Data Enrichment Script**:
   ```bash
   python enrich_domains.py
   ```
   This script:
   - Reads the basic metadata from `llms_metadata.json`
   - Queries the Cloudflare API to get domain categories
   - Adds the category information to the metadata
   - Outputs the enriched data to `llms_metadata_enriched.json`

3. **Update the Astro Project Data**:
   ```bash
   cp llms_metadata_enriched.json astro-llms-explorer/src/data/
   ```

4. **Rebuild and Redeploy the Site**:
   ```bash
   cd astro-llms-explorer
   npm run build
   # Deploy using your preferred method
   ```

#### Scheduling Regular Updates

To keep the data fresh, consider setting up a scheduled task:

**Using cron (Linux/macOS)**:
```bash
# Edit crontab
crontab -e

# Add a weekly update job (runs every Monday at 2 AM)
0 2 * * 1 cd /path/to/project && python acquire_data.py && python enrich_domains.py && cp llms_metadata_enriched.json astro-llms-explorer/src/data/ && cd astro-llms-explorer && npm run build && npm run deploy
```

**Using Task Scheduler (Windows)**:
1. Create a batch file (update.bat) with the update commands
2. Open Task Scheduler and create a new task
3. Set the trigger to weekly
4. Set the action to run the batch file

### Data Structure

The `llms_metadata_enriched.json` file has the following structure:

```json
[
  {
    "url": "https://example.com/llms.txt",
    "sha256": "7b81a6685836930f8e2adee4fc9afa07c5be9a7068de3374b4c6078255280c64",
    "metadata": {
      "source_domain": "example.com",
      "cf_categories": [
        "Technology",
        "Information Technology"
      ]
    },
    "last_checked_utc": "2025-04-02T05:14:18Z"
  },
  // More entries...
]
```

If you need to modify the data structure:

1. Update the data acquisition and enrichment scripts
2. Update the data processing in `src/pages/index.astro`
3. Update any components that use the data

### Troubleshooting Data Issues

#### Missing or Incomplete Data

If the data acquisition script fails to find LLMS.txt files:

1. Check the API keys in your `.env` file
2. Verify the Brave Search API and GitHub API are accessible
3. Check the rate limits for the APIs
4. Try running the script with a smaller set of domains

#### Enrichment Failures

If the data enrichment script fails:

1. Check the Cloudflare API key and account ID
2. Verify the Cloudflare API is accessible
3. Check the rate limits for the API
4. Try running the script with a smaller set of domains

#### Data Format Issues

If the data format is incorrect:

1. Validate the JSON files using a JSON validator
2. Check for encoding issues in the data files
3. Verify the data structure matches what the Astro components expect

## Site Maintenance

### Updating Dependencies

Regularly update the project dependencies to ensure security and performance:

1. **Check for Updates**:
   ```bash
   npm outdated
   ```

2. **Update Dependencies**:
   ```bash
   npm update
   ```

3. **For Major Version Updates**:
   ```bash
   # Install npm-check-updates
   npm install -g npm-check-updates
   
   # Check for major updates
   ncu
   
   # Apply updates (carefully)
   ncu -u
   
   # Reinstall dependencies
   npm install
   ```

4. **Test After Updates**:
   ```bash
   npm run dev
   ```

### Adding New Features

When adding new features to the site:

1. **Create a New Branch**:
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Implement the Feature**:
   - Add new components in `src/components/`
   - Update existing pages or add new ones in `src/pages/`
   - Add any necessary styles

3. **Test the Feature**:
   ```bash
   npm run dev
   ```

4. **Build and Test Production**:
   ```bash
   npm run build
   npm run preview
   ```

5. **Merge and Deploy**:
   ```bash
   git checkout main
   git merge feature/new-feature
   # Deploy using your preferred method
   ```

### Modifying the Design

The site uses TailwindCSS for styling. To modify the design:

1. **Global Styles**:
   - Edit `src/styles/global.css` for global styles
   - Update TailwindCSS configuration in `tailwind.config.mjs`

2. **Component Styles**:
   - Edit the TailwindCSS classes in the component files
   - For complex components, consider using component-specific CSS files

3. **Layout Changes**:
   - Edit `src/layouts/Layout.astro` for site-wide layout changes
   - Update the responsive design breakpoints as needed

4. **Theme Customization**:
   - Modify the theme colors in `tailwind.config.mjs`:
     ```javascript
     theme: {
       extend: {
         colors: {
           primary: {
             50: '#f0f9ff',
             100: '#e0f2fe',
             // ...
           },
           // ...
         },
       },
     },
     ```

### Adding New Pages

To add new pages to the site:

1. **Create a New Page File**:
   - Add a new `.astro` file in `src/pages/`
   - Use the `Layout` component for consistent styling

2. **Update Navigation**:
   - Add links to the new page in the navigation menu
   - Update the footer links if necessary

3. **Update SEO**:
   - Add appropriate meta tags and structured data
   - Update the sitemap.xml file

4. **Example Page**:
   ```astro
   ---
   import Layout from '../layouts/Layout.astro';
   import StructuredData from '../components/StructuredData.astro';
   ---

   <Layout
     title="New Page | LLMS.txt Explorer"
     description="Description of the new page"
   >
     <StructuredData
       type="WebPage"
       data={{
         "name": "New Page",
         "description": "Description of the new page",
         // ...
       }}
     />

     <div class="container mx-auto px-4 py-8">
       <h1 class="text-3xl font-bold mb-4">New Page</h1>
       <p>Content goes here...</p>
     </div>
   </Layout>
   ```

## SEO Maintenance

### Updating Meta Tags

The site uses meta tags for SEO. To update them:

1. **Edit the Layout Component**:
   - Open `src/layouts/Layout.astro`
   - Update the meta tags in the `<head>` section

2. **Page-Specific Meta Tags**:
   - Pass props to the `Layout` component when using it in a page:
     ```astro
     <Layout
       title="Custom Title | LLMS.txt Explorer"
       description="Custom description for this page"
       image="/custom-image.png"
     >
       <!-- Page content -->
     </Layout>
     ```

3. **Important Meta Tags to Maintain**:
   - Title
   - Description
   - Open Graph tags
   - Twitter Card tags
   - Canonical URL

### Structured Data

The site uses structured data for rich search results. To update it:

1. **Edit the StructuredData Component**:
   - Open `src/components/StructuredData.astro`
   - Update the structured data schema as needed

2. **Page-Specific Structured Data**:
   - Use the `StructuredData` component in each page:
     ```astro
     <StructuredData
       type="WebPage"
       data={{
         "name": "Page Name",
         "description": "Page description",
         // Other properties...
       }}
     />
     ```

3. **Test Structured Data**:
   - Use [Google's Rich Results Test](https://search.google.com/test/rich-results)
   - Use [Schema.org Validator](https://validator.schema.org/)

### Sitemap and Robots.txt

Keep the sitemap and robots.txt files updated:

1. **Update Sitemap**:
   - Open `public/sitemap.xml`
   - Add new pages to the sitemap
   - Update the `lastmod` dates

2. **Update Robots.txt**:
   - Open `public/robots.txt`
   - Update the rules as needed
   - Ensure the sitemap URL is correct

3. **Automatic Sitemap Generation**:
   - The site uses `@astrojs/sitemap` integration
   - It automatically generates a sitemap based on the pages
   - Configure it in `astro.config.mjs`:
     ```javascript
     import sitemap from '@astrojs/sitemap';

     export default defineConfig({
       // ...
       integrations: [
         sitemap({
           filter: (page) => !page.includes('/private/'),
         }),
       ],
     });
     ```

## Performance Monitoring

### Web Vitals

Monitor the site's performance using Web Vitals:

1. **Use Lighthouse**:
   - Open Chrome DevTools
   - Go to the Lighthouse tab
   - Run an audit for Performance, Accessibility, SEO, and Best Practices

2. **Use PageSpeed Insights**:
   - Visit [PageSpeed Insights](https://pagespeed.web.dev/)
   - Enter your site's URL
   - Analyze the results

3. **Monitor Real User Metrics**:
   - Consider adding a monitoring service like [Web Vitals](https://github.com/GoogleChrome/web-vitals)
   - Track Core Web Vitals in your analytics

### Optimizing Assets

Keep the site's assets optimized:

1. **Images**:
   - Use modern formats (WebP, AVIF)
   - Optimize images using tools like [Squoosh](https://squoosh.app/)
   - Use appropriate sizes for different devices
   - Implement lazy loading

2. **JavaScript**:
   - Minimize unused JavaScript
   - Use code splitting
   - Defer non-critical scripts

3. **CSS**:
   - Minimize unused CSS
   - Use critical CSS
   - Defer non-critical CSS

### Caching Strategy

The site uses caching headers for performance. To update them:

1. **Netlify/Cloudflare Headers**:
   - Edit `public/_headers`
   - Update the caching rules as needed

2. **Apache Server**:
   - Edit `public/.htaccess`
   - Update the caching rules as needed

3. **Caching Best Practices**:
   - Use long cache times for static assets
   - Use versioning or hashing for cache busting
   - Set appropriate stale-while-revalidate values

## Troubleshooting

### Common Issues

#### Build Errors

- **Issue**: TailwindCSS classes not working
  - **Solution**: Check the TailwindCSS configuration and ensure the content paths are correct

- **Issue**: TypeScript errors
  - **Solution**: Run `npx tsc --noEmit` to check for TypeScript errors and fix them

- **Issue**: Astro component errors
  - **Solution**: Check the component syntax and ensure all imports are correct

#### Runtime Errors

- **Issue**: Data not loading
  - **Solution**: Check the data file path and format

- **Issue**: Images not displaying
  - **Solution**: Check the image paths and ensure the images exist

- **Issue**: JavaScript errors
  - **Solution**: Check the browser console for errors and fix them

### Debugging Tips

1. **Use the Browser DevTools**:
   - Check the Console tab for errors
   - Use the Network tab to check requests
   - Use the Elements tab to inspect the DOM

2. **Enable Astro Dev Tools**:
   - Install the [Astro DevTools extension](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode)
   - Use it to inspect components and debug issues

3. **Check the Build Output**:
   - Look at the `dist` directory after building
   - Verify that all files are being generated correctly

4. **Use Verbose Logging**:
   - Run build with verbose logging: `npm run build -- --verbose`
   - Check the logs for any warnings or errors