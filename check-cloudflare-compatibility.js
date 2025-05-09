#!/usr/bin/env node

/**
 * This script checks for Node.js-specific modules and APIs that might cause
 * compatibility issues when deploying to Cloudflare Pages.
 * 
 * Run with: node check-cloudflare-compatibility.js
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';

// Patterns to search for
const PATTERNS = [
  {
    pattern: /import\s+.*\s+from\s+['"]node:/,
    description: "Node.js prefixed import (import ... from 'node:...')"
  },
  {
    pattern: /import\s+.*\s+from\s+['"]fs['"]|require\(['"]fs['"]\)/,
    description: "Node.js filesystem module (fs)"
  },
  {
    pattern: /import\s+.*\s+from\s+['"]path['"]|require\(['"]path['"]\)/,
    description: "Node.js path module (path)"
  },
  {
    pattern: /import\s+.*\s+from\s+['"]crypto['"]|require\(['"]crypto['"]\)/,
    description: "Node.js crypto module (crypto)"
  },
  {
    pattern: /import\s+.*\s+from\s+['"]http['"]|import\s+.*\s+from\s+['"]https['"]|require\(['"]http['"]\)|require\(['"]https['"]\)/,
    description: "Node.js HTTP/HTTPS modules (http/https)"
  },
  {
    pattern: /process\.env\./,
    description: "Node.js process.env (use import.meta.env instead)"
  },
  {
    pattern: /__dirname|__filename/,
    description: "Node.js __dirname or __filename"
  },
  {
    pattern: /fs\.(read|write|append|exists|stat|mkdir|rmdir|unlink|readdir)/,
    description: "Node.js filesystem operations"
  },
  {
    pattern: /path\.(join|resolve|dirname|basename|extname)/,
    description: "Node.js path operations"
  }
];

// File extensions to check
const EXTENSIONS = ['.js', '.ts', '.mjs', '.cjs', '.jsx', '.tsx', '.astro'];

// Directories to exclude
const EXCLUDE_DIRS = ['node_modules', 'dist', '.git'];

// Files to exclude
const EXCLUDE_FILES = ['check-cloudflare-compatibility.js', 'test-search-api.js'];

// ANSI color codes for output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Results storage
const issues = [];

/**
 * Recursively scan directories for files to check
 */
async function scanDirectory(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      // Skip excluded directories
      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(entry.name)) {
          await scanDirectory(fullPath);
        }
        continue;
      }
      
      // Skip excluded files
      if (EXCLUDE_FILES.includes(entry.name)) {
        continue;
      }
      
      // Check only files with specified extensions
      const ext = extname(entry.name).toLowerCase();
      if (EXTENSIONS.includes(ext)) {
        await checkFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`${COLORS.red}Error scanning directory ${dir}:${COLORS.reset}`, error);
  }
}

/**
 * Check a single file for Node.js-specific patterns
 */
async function checkFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i];
      
      for (const { pattern, description } of PATTERNS) {
        if (pattern.test(line)) {
          issues.push({
            file: filePath,
            line: lineNumber,
            content: line.trim(),
            description
          });
        }
      }
    }
  } catch (error) {
    console.error(`${COLORS.red}Error checking file ${filePath}:${COLORS.reset}`, error);
  }
}

/**
 * Print the results
 */
function printResults() {
  console.log('\n');
  console.log(`${COLORS.cyan}========================================================${COLORS.reset}`);
  console.log(`${COLORS.cyan}= Cloudflare Compatibility Check Results              =${COLORS.reset}`);
  console.log(`${COLORS.cyan}========================================================${COLORS.reset}`);
  
  if (issues.length === 0) {
    console.log(`\n${COLORS.green}✓ No compatibility issues found!${COLORS.reset}\n`);
    console.log(`${COLORS.green}Your project should be compatible with Cloudflare Pages.${COLORS.reset}`);
  } else {
    console.log(`\n${COLORS.red}✗ Found ${issues.length} potential compatibility issues:${COLORS.reset}\n`);
    
    // Group issues by file
    const fileGroups = {};
    for (const issue of issues) {
      if (!fileGroups[issue.file]) {
        fileGroups[issue.file] = [];
      }
      fileGroups[issue.file].push(issue);
    }
    
    // Print issues grouped by file
    for (const [file, fileIssues] of Object.entries(fileGroups)) {
      console.log(`${COLORS.yellow}File: ${file}${COLORS.reset}`);
      
      for (const issue of fileIssues) {
        console.log(`  ${COLORS.red}Line ${issue.line}:${COLORS.reset} ${issue.description}`);
        console.log(`    ${COLORS.magenta}${issue.content}${COLORS.reset}`);
      }
      
      console.log('');
    }
    
    console.log(`${COLORS.yellow}These Node.js-specific features may cause issues when deployed to Cloudflare Pages.${COLORS.reset}`);
    console.log(`${COLORS.yellow}Please review the documentation for Cloudflare-compatible alternatives:${COLORS.reset}`);
    console.log(`${COLORS.blue}https://developers.cloudflare.com/workers/runtime-apis/nodejs/\n${COLORS.reset}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${COLORS.cyan}Checking project for Cloudflare compatibility issues...${COLORS.reset}`);
  
  // Start scanning from the current directory
  await scanDirectory('.');
  
  // Print the results
  printResults();
}

// Run the script
main().catch(error => {
  console.error(`${COLORS.red}Error running compatibility check:${COLORS.reset}`, error);
  process.exit(1);
});