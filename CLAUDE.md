# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **LLMS.txt Explorer** - a web application that discovers, indexes, and provides searchable access to `llms.txt` and `llms-full.txt` files from across the internet. It supports the [llmstxt.org](https://llmstxt.org/) standard for how websites communicate with Large Language Models.

## Development Commands

```bash
# Development
npm install                    # Install dependencies
npm run dev                   # Start dev server at localhost:4321

# Build & Preview  
npm run build                 # Build for production
npm run preview              # Preview production build locally

# Testing & Validation
node check-cloudflare-compatibility.js  # Check build compatibility
node check-sitemap.js                   # Validate sitemap generation
```

## Tech Stack & Architecture

- **Astro 5.6.1** with SSR and Cloudflare adapter
- **TailwindCSS** for styling with dark theme support  
- **TypeScript** for type safety
- **Cloudflare Pages + Workers** for hosting and serverless functions
- **Cloudflare KV** for session storage (requires "SESSION" namespace binding)

## Key Architecture Patterns

### Data Layer
- **Primary Database**: `src/data/llms_metadata.json` (~50k entries)
- **Data Structure**: Each entry contains URL, domain, quality score, topic rankings, and metadata
- **APIs**: Search endpoints at `/api/search-llms.ts` and `/api/search-llms-all.ts`

### Rendering Strategy
- **Static pages**: Blog, about, legal (pre-rendered)
- **Dynamic pages**: Main explorer, APIs (SSR with Cloudflare Workers)
- **Client-side**: Interactive DataTables for the main explorer interface

### Content Management
- **Blog**: Markdown files in `src/content/blog/` with frontmatter
- **Collections**: Type-safe content collections configured in `src/content/config.ts`

## Important File Locations

- **Main Data**: `src/data/llms_metadata.json` - core database of llms.txt files
- **API Endpoints**: `src/pages/api/` - search and data access APIs
- **Main Explorer**: `src/pages/index.astro` - primary user interface with DataTables
- **Blog Components**: `src/components/blog/` - specialized blog functionality
- **Configuration**: `astro.config.mjs`, `wrangler.toml` for Cloudflare settings

## Data Model

Each llms.txt entry follows this structure:
- `url`, `domain`, `content_hash`, `title`, `summary`
- `quality`: "High" | "Medium" | "Low" based on spec compliance
- `metadata.url_topic_ranking`: AI-generated topic classifications with relevance scores
- `first_added`, `last_updated`: Tracking discovery and content changes
- `metadata.url_token_count`: Token count for LLM context awareness

## Development Notes

- **Sessions**: Requires Cloudflare KV namespace binding named "SESSION"
- **Compatibility**: Use `nodejs_compat` flag for Node.js APIs in Workers
- **Security**: Custom headers configured in `public/_headers`
- **API Middleware**: Located in `src/pages/api/middleware/` for validation and logging
- **Asset Optimization**: Images in `src/assets/` and `public/assets/blog/`

## Deployment

- **Platform**: Cloudflare Pages with automatic GitHub deployments
- **Manual Deploy**: Use `deploy.sh` script
- **Sitemap**: Auto-generated with custom filtering for API routes
- **Compression**: HTML/CSS/JS automatically compressed via `astro-compress`

## Key Features

- **Quality Scoring**: Validates llms.txt files against official specification
- **Topic Classification**: AI-powered content analysis and categorization  
- **Change Tracking**: Monitors content updates via hash comparison
- **Interactive Explorer**: DataTables-based interface with expandable details
- **Blog Integration**: Educational content about the llms.txt standard