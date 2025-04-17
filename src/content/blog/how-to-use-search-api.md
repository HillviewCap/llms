---
title: "How to Use Our Search API"
description: "A comprehensive guide to using the LLMs search API for querying metadata and content."
pubDate: 2025-04-17
tags: ["api", "search", "development"]
---

# How to Use Our Search API

_3 min read_

Our site provides a powerful search API that allows you to programmatically search through our LLMs metadata collection. This guide explains how to use the API, available at `/api/search-llms`, to find specific sites, query metadata, and handle pagination.

## API Overview

The search API is designed to help you find relevant LLM-compatible websites based on various search criteria. It provides a simple RESTful interface that returns JSON responses containing matching results from our database.

### Endpoint

```
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

The `q` parameter is **required** and specifies the search query. The API searches for this term in the title and summary fields of the LLM metadata. For example:

```
/api/search-llms?q=cloudflare
```

This will return all entries where "cloudflare" appears in the title or summary.

### The `fileType` Parameter

The `fileType` parameter is optional and filters results by the type of LLM file. Valid values are:

- `llms.txt` - Only return sites with the basic llms.txt file
- `llms-full.txt` - Only return sites with the comprehensive llms-full.txt file
- `both` (default) - Return sites with either file type

Example:

```
/api/search-llms?q=documentation&fileType=llms-full.txt
```

This will return only sites with llms-full.txt files that match the query "documentation".

### Pagination Parameters

The API supports pagination through the `page` and `limit` parameters:

- `page` - Specifies which page of results to return (starts at 1)
- `limit` - Specifies how many results to return per page (default: 10, max: 50)

Example:

```
/api/search-llms?q=ai&page=2&limit=20
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
      "title": "Example Site",
      "summary": "This is an example site with LLM support.",
      "last_updated": "2025-04-07T02:21:20Z",
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
        ]
      }
    }
    // Additional results...
  ]
}
```

### Response Fields

Each result in the `results` array contains:

- `url` - The URL of the LLM file
- `domain` - The domain of the website
- `title` - The title of the website
- `summary` - A brief summary of the website content (if available)
- `last_updated` - When the entry was last updated
- `metadata` - Additional metadata about the site, including:
  - `source_domain` - The original domain
  - `url_purpose_ranking` - Purpose categories for the URL
  - `url_topic_ranking` - Topic rankings for the URL with scores
  - `domain_purpose_ranking` - Purpose categories for the domain
  - `domain_topic_ranking` - Topic rankings for the domain with scores

## Example API Requests

### Basic Search

To search for sites related to "AI":

```
GET /api/search-llms?q=AI
```

**curl example:**

```bash
curl "https://llms-text.ai/api/search-llms?q=AI"
```

**wget example:**

```bash
wget -O - "https://llms-text.ai/api/search-llms?q=AI"
```

### Filtering by File Type

To search for sites with llms-full.txt files related to "documentation":

```
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

### Searching for Specific Domains

To find entries from a specific domain:

```
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

### Searching for Topics in Metadata

To find sites categorized under a specific topic:

```
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

This will return sites where "Software Development" appears in the title, summary, or is a significant topic in the metadata rankings.

### Paginated Results

To get the second page of results with 20 results per page:

```
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

## Best Practices

1. **Use specific search terms** - More specific queries yield more relevant results
2. **Implement pagination** - Always handle pagination for queries that might return many results
3. **Handle errors gracefully** - Check for error responses and display appropriate messages
4. **Cache results when appropriate** - Consider caching results to reduce API load

## Conclusion

Our search API provides a powerful way to programmatically access our database of LLM-compatible websites. By using the various query parameters and understanding the response format, you can build applications that leverage this data effectively.

For any questions or issues with the API, please contact our support team.
