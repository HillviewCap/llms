---
title: "How to Use Our Search API"
description: "A comprehensive guide to using the LLMs search API for querying metadata and content."
pubDate: 2025-04-17
tags: ["api", "search", "development"]
image: "/assets/apple-touch-icon.png"
---

# How to Use Our Search API

_By Zach · April 17, 2025 · 3 min read_

Our site provides a powerful search API that allows you to programmatically search through our LLMs metadata collection. This guide explains how to use the API, available at `/api/search-llms`, to find specific sites, query metadata, and handle pagination.

## API Overview

The search API is designed to help you find relevant LLM-compatible websites based on various search criteria. It provides a simple RESTful interface that returns JSON responses containing matching results from our database.

### Endpoint

```http
GET /api/search-llms
```

## Query Parameters

The API accepts the following query parameters:

| Parameter | Required | Default | Description                                                            |
| --------- | -------- | ------- | ---------------------------------------------------------------------- |
| q         | Yes      | -       | The search query string                                                |
| fileType  | No       | "both"  | Type of LLM file to search for: "llms.txt", "llms-full.txt", or "both" |
| page      | No       | 1       | Page number for paginated results                                      |
| limit     | No       | 10      | Number of results per page (max: 50)                                   |

### The `q` Parameter

The `q` parameter is **required** and specifies the search query. The API performs a comprehensive search across multiple fields including:

- Domain and URL
- Title and summary
- All metadata fields including:
  - Source domain
  - Topic rankings (both URL and domain)
  - Purpose rankings (both URL and domain)

For example:

```http
GET /api/search-llms?q=cloudflare
```

This will return all entries where "cloudflare" appears in any of these searchable fields, providing more comprehensive results than before.

### The `fileType` Parameter

The `fileType` parameter is optional and filters results by the type of LLM file. Valid values are:

- `llms.txt` - Only return sites with the basic llms.txt file
- `llms-full.txt` - Only return sites with the comprehensive llms-full.txt file
- `both` (default) - Return sites with either file type

Example:

```http
GET /api/search-llms?q=documentation&fileType=llms-full.txt
```

This will return only sites with llms-full.txt files that match the query "documentation".

### Pagination Parameters

The API supports pagination through the `page` and `limit` parameters:

- `page` - Specifies which page of results to return (starts at 1)
- `limit` - Specifies how many results to return per page (default: 10, max: 50)

Example:

```http
GET /api/search-llms?q=ai&page=2&limit=20
```

This will return the second page of results for the query "ai", with 20 results per page.

## Response Format

The API returns JSON responses with the following structure:

```json
{
  "totalResults": 42,
  "page": 1,
  "limit": 10,
  "results": [
    {
      "url": "https://example.com/llms.txt",
      "domain": "example.com",
      "content_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z",
      "last_checked_utc": "2025-05-09T16:20:52.451356Z",
      "title": "Example Site",
      "summary": "This is an example site with LLM support.",
      "quality": "Medium",
      "metadata": {
        "source_domain": "example.com",
        "url_purpose_ranking": ["Plain Text Resource"],
        "url_topic_ranking": [
          ["AI/ML", 278],
          ["Software Development", 204],
          ["Science", 150]
        ],
        "domain_purpose_ranking": ["Other"],
        "domain_topic_ranking": [
          ["Software Development", 15],
          ["Science", 11],
          ["Education", 10]
        ],
        "url_token_count": 45678,
        "previous_url_token_count": 45000
      },
      "first_added": "2025-04-04T17:49:02Z",
      "last_updated": "2025-05-09T16:20:52.451356Z",
      "previous_content_hash": "z5y4x3w2v1u0t9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a"
    }
    // Additional results...
  ]
}
```

### Response Fields

Each result in the `results` array contains:

- `url` - The URL of the LLM file
- `domain` - The domain of the website
- `content_hash` - A hash of the file content for version tracking
- `last_checked_utc` - When the content was last validated
- `title` - The title of the website
- `summary` - A brief summary of the website content (if available)
- `quality` - Quality rating of the content (e.g., "High", "Medium", "Low")
- `metadata` - Additional metadata about the site, including:
  - `source_domain` - The original domain
  - `url_purpose_ranking` - Purpose categories for the URL
  - `url_topic_ranking` - Topic rankings for the URL with scores
  - `domain_purpose_ranking` - Purpose categories for the domain
  - `domain_topic_ranking` - Topic rankings for the domain with scores
  - `url_token_count` - Approximate token count of the content
  - `previous_url_token_count` - Token count from previous check (if available)
- `first_added` - When the entry was first added to the database
- `last_updated` - When the entry was last updated
- `previous_content_hash` - Hash of the previous version (if available)

## Example API Requests

### Basic Search

To search for sites related to "AI":

```http
GET /api/search-llms?q=AI
```

**curl example:** (available on Windows 10+ and all Unix-based systems)

```bash
curl "https://llms-text.ai/api/search-llms?q=AI"
```

**wget example:**

```bash
wget -O - "https://llms-text.ai/api/search-llms?q=AI"
```

**PowerShell example:** (native to Windows)

```powershell
Invoke-WebRequest -Uri "https://llms-text.ai/api/search-llms?q=AI" | Select-Object -ExpandProperty Content
# Shorthand version:
iwr -Uri "https://llms-text.ai/api/search-llms?q=AI" | Select -ExpandProperty Content
```

### Filtering by File Type

To search for sites with llms-full.txt files related to "documentation":

```http
GET /api/search-llms?q=documentation&fileType=llms-full.txt
```

**curl example:**

```bash
curl "https://llms-text.ai/api/search-llms?q=documentation&fileType=llms-full.txt"
```

**wget example:**

```bash
wget -O - "https://llms-text.ai/api/search-llms?q=documentation&fileType=llms-full.txt"
```

**PowerShell example:**

```powershell
Invoke-WebRequest -Uri "https://llms-text.ai/api/search-llms?q=documentation&fileType=llms-full.txt" | Select-Object -ExpandProperty Content
# Shorthand version:
iwr -Uri "https://llms-text.ai/api/search-llms?q=documentation&fileType=llms-full.txt" | Select -ExpandProperty Content
```

### Searching for Specific Domains

To find entries from a specific domain:

```http
GET /api/search-llms?q=cloudflare.com
```

**curl example:**

```bash
curl "https://llms-text.ai/api/search-llms?q=cloudflare.com"
```

**wget example:**

```bash
wget -O - "https://llms-text.ai/api/search-llms?q=cloudflare.com"
```

**PowerShell example:**

```powershell
Invoke-WebRequest -Uri "https://llms-text.ai/api/search-llms?q=cloudflare.com" | Select-Object -ExpandProperty Content
# Shorthand version:
iwr -Uri "https://llms-text.ai/api/search-llms?q=cloudflare.com" | Select -ExpandProperty Content
```

### Searching for Topics in Metadata

To find sites categorized under a specific topic:

```http
GET /api/search-llms?q=Software+Development
```

**curl example:**

```bash
curl "https://llms-text.ai/api/search-llms?q=Software+Development"
```

**wget example:**

```bash
wget -O - "https://llms-text.ai/api/search-llms?q=Software+Development"
```

**PowerShell example:**

```powershell
Invoke-WebRequest -Uri "https://llms-text.ai/api/search-llms?q=Software+Development" | Select-Object -ExpandProperty Content
# Shorthand version:
iwr -Uri "https://llms-text.ai/api/search-llms?q=Software+Development" | Select -ExpandProperty Content
```

This will return sites where "Software Development" appears in the domain, URL, title, summary, or any of the metadata fields, including topic and purpose rankings.

### Paginated Results

To get the second page of results with 20 results per page:

```http
GET /api/search-llms?q=AI&page=2&limit=20
```

**curl example:**

```bash
curl "https://llms-text.ai/api/search-llms?q=AI&page=2&limit=20"
```

**wget example:**

```bash
wget -O - "https://llms-text.ai/api/search-llms?q=AI&page=2&limit=20"
```

**PowerShell example:**

```powershell
Invoke-WebRequest -Uri "https://llms-text.ai/api/search-llms?q=AI&page=2&limit=20" | Select-Object -ExpandProperty Content
# Shorthand version:
iwr -Uri "https://llms-text.ai/api/search-llms?q=AI&page=2&limit=20" | Select -ExpandProperty Content
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

### 400 Bad Request

Returned when:

- The `q` parameter is missing or empty
- The `fileType` parameter has an invalid value
- The `page` or `limit` parameters are not positive integers
- The requested page is out of range

Example error response:

```json
{
  "error": "Missing or empty search query parameter \"q\"."
}
```

### 500 Internal Server Error

Returned when there's an unexpected error processing the request:

```json
{
  "error": "Internal Server Error processing search request."
}
```

## Windows Compatibility Note

While the examples above show both curl/wget (Unix-based) and PowerShell approaches, it's worth noting that:

- **curl** is now available natively on Windows 10 and later versions
- **PowerShell** examples using `Invoke-WebRequest` (alias: `iwr`) are native to all modern Windows systems
- Choose the approach that best fits your environment and scripting preferences

## Best Practices

1. **Use specific search terms** - More specific queries yield more relevant results
2. **Implement pagination** - Always handle pagination for queries that might return many results
3. **Handle errors gracefully** - Check for error responses and display appropriate messages
4. **Cache results when appropriate** - Consider caching results to reduce API load
5. **Search domains directly** - You can directly search for specific domains in the query
6. **Utilize topic searching** - Search for specific topics like "Cybersecurity" or "AI/ML" to find relevant content

## Conclusion

Our search API provides a powerful way to programmatically access our database of LLM-compatible websites. By using the various query parameters and understanding the response format, you can build applications that leverage this data effectively.

For any questions or issues with the API, please contact our support team.
