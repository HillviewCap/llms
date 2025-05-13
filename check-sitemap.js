#!/usr/bin/env node

/**
 * This script verifies the sitemap.xml is correctly deployed and accessible on Cloudflare
 */

import fetch from 'node-fetch';

const SITE_URL = 'https://llms-text.ai';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

async function checkSitemap() {
  console.log(`Checking sitemap at: ${SITEMAP_URL}`);
  
  try {
    const response = await fetch(SITEMAP_URL);
    
    if (!response.ok) {
      console.error(`❌ Error: Sitemap request failed with status ${response.status} ${response.statusText}`);
      return false;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('xml')) {
      console.warn(`⚠️ Warning: Sitemap does not have XML content type (got: ${contentType})`);
    }
    
    const content = await response.text();
    
    if (content.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
      console.log(`✅ Sitemap is accessible and contains valid XML`);
      console.log(`\nSitemap content preview:\n${content.substring(0, 500)}...\n`);
      return true;
    } else {
      console.error(`❌ Error: Sitemap does not contain expected XML structure`);
      console.log(`\nActual content received:\n${content.substring(0, 500)}...\n`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

// Run the checks
checkSitemap().then(success => {
  if (success) {
    console.log('✅ Sitemap check completed successfully');
  } else {
    console.log('❌ Sitemap check failed. Please review the issues above.');
  }
});