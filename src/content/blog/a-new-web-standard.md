---
title: "A New Web Standard"
description: "An overview of the llms.txt web standard for helping LLMs understand website content."
pubDate: 2025-04-17
tags: ["llms", "web standard", "ai"]
image: "/assets/blog/a-new-web-standard-card.jpg"
---

# A New Web Standard

_By Zach · April 17, 2025 · 3 min read_

The llms.txt file, introduced in September 2024, represents a new web standard designed to help Large Language Models (LLMs) efficiently process and understand website content by providing structured, markdown-formatted information that bypasses the complexities of HTML parsing and content filtering.

## Understanding LLMS.txt Standard

The standard consists of two primary file formats that serve different purposes. The basic llms.txt acts as a concise index file containing website summaries and links to markdown versions of important pages, essentially providing a roadmap for AI systems to navigate your content. Meanwhile, llms-full.txt offers a comprehensive approach by consolidating all technical documentation into a single extensive markdown document, eliminating the need for additional navigation but potentially exceeding an LLM's context window limitations for sites with extensive content.

This innovative approach addresses several challenges LLMs face when processing traditional web content, including:

- Wasted processing power parsing irrelevant HTML/JavaScript
- Difficulty distinguishing between core content and supplementary elements
- Missing important context between pages

Unlike robots.txt (which controls crawling permissions) or sitemap.xml (which lists indexable pages), llms.txt specifically focuses on helping AI systems understand your content when users request information related to your site.

## File Structure Guidelines

To create an effective llms.txt file, follow a specific markdown structure that begins with an H1 header containing your website name, followed by a blockquote that concisely summarizes your site's purpose. The document should then include additional markdown sections providing context, H2 sections categorizing content with links to markdown versions, and optional sections that can be omitted if context length becomes constrained.

A properly formatted llms.txt includes:

- Links to markdown versions of pages (typically appended with .md to the original URL)
- Brief descriptions of each linked resource
- Hierarchical organization of content using proper markdown heading levels
- Clean, structured content free from HTML markup and JavaScript

This standardized structure ensures LLMs can efficiently parse your content's hierarchy and understand relationships between different sections of your website, making it easier for AI systems to provide accurate information about your offerings when queried by users.

## Implementation Steps

Implementing llms.txt on your website involves a three-step process:

1. Create the actual file. Website owners can either manually craft this document or utilize automated tools like the "Website LLMs.txt" WordPress plugin, dotenvx/llmstxt for static sites, or online generators such as llmstxtgenerator.org and llmstxt.firecrawl.dev.

2. Provide markdown versions of key pages by appending .md to original URLs (e.g., `https://example.com/blog/important-article.md`). For URLs without filenames, append index.html.md instead.

3. Upload the llms.txt file to your server's root directory and ensure all markdown versions of your pages are accessible at their respective URLs.

This standardized implementation allows any website, regardless of size or complexity, to make their content more accessible to AI systems in a structured, machine-readable format.

## Benefits and Adoption

Despite being relatively new, the llms.txt standard has gained significant traction with major organizations already implementing it, including Anthropic, Hugging Face, Perplexity, Zapier, and Cloudflare. Frameworks like LangChain and LangGraph have also integrated the standard into their documentation.

Website owners who adopt this standard gain several advantages:

- More accurate AI representation of their products and services
- Enhanced user experience when visitors use AI assistants to inquire about offerings
- Competitive edge as AI-driven search becomes more prevalent
- Efficient content extraction without HTML and script interference
- Future-proofing as AI information retrieval systems continue to evolve

When deciding between formats, llms.txt works best for larger websites where compiling all content would exceed LLM context windows, while llms-full.txt is ideal for smaller sites or specific documentation where having consolidated content is beneficial.
