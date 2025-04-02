# Plan for Domain Enrichment using Cloudflare API

This plan outlines the process for enriching the `llms_metadata.json` dataset with additional information about the source domains, primarily focusing on content categories using the Cloudflare Radar API.

**1. Rationale for Separation:**

*   Keep data *acquisition* (`acquire_data.py`) separate from data *enrichment*.
*   Enrichment involves potentially slower, rate-limited external lookups.
*   Allows independent execution and modification of the enrichment process.

**2. New Script: `enrich_domains.py`**

*   A new Python script dedicated to the enrichment task.

**3. Dependencies:**

*   `cloudflare` Python library (add to `requirements.txt`).
*   `requests` (likely already present).

**4. Authentication:**

*   Requires Cloudflare API credentials set as environment variables:
    *   `CLOUDFLARE_EMAIL`
    *   `CLOUDFLARE_API_KEY`

**5. Enrichment Workflow (`enrich_domains.py`):**

```mermaid
graph TD
    A[Start enrich_domains.py] --> B(Load llms_metadata.json);
    B --> C{Extract Unique Domains};
    C --> D(Initialize Cloudflare Client);
    D --> E{For Each Unique Domain};
    E --> F(Call Cloudflare Intel/Radar API for Domain);
    F -- Success --> G(Extract Categories from Response);
    F -- Error --> H(Handle API Error / Not Found);
    G --> I{Store Enrichment Results (Categories)};
    H --> I;
    E -- Loop Finished --> J(Merge Enrichment Data into Original Records);
    J --> K(Save Enriched Data to New File: llms_metadata_enriched.json);
    K --> L[End];

    subgraph Cloudflare API Call
        direction LR
        F1[domain_name] --> F2(client.intel.domains.get or similar);
        F2 --> F3{Response};
        F3 -- Data Found --> G;
        F3 -- Error/Not Found --> H;
    end

    style F2 fill:#cde,stroke:#333,stroke-width:2px
```

**6. Steps within `enrich_domains.py`:**

*   **Load Data:** Read `llms_metadata.json`.
*   **Extract Unique Domains:** Get a set of unique `source_domain` values.
*   **Initialize Client:** Create the `Cloudflare` client instance using credentials from environment variables.
*   **Enrichment Loop:** Iterate through unique domains:
    *   **API Call:** Use the Cloudflare client to fetch domain intelligence (e.g., using `client.intel.domains.get(domain=...)` or a similar confirmed endpoint).
    *   **Extract Data:** From the API response, extract the list of category names from `result.content_categories`. Attempt to find organization info (e.g., via ASN details if available/feasible, otherwise mark as unavailable).
    *   **Handle Errors:** Implement try-except blocks for API errors, rate limits, or missing data. Store `None` or default values (e.g., empty list for categories).
    *   **Rate Limiting:** Include `time.sleep()` (e.g., 0.5-1s) in the loop.
    *   **Store Results:** Maintain a dictionary mapping domains to fetched categories (e.g., `{'example.com': {'cf_categories': ['Technology']}}`).
*   **Merge Data:** Add the fetched `cf_categories` (and any org info found) to each record in the original list, likely within the `metadata` dictionary.
*   **Save Data:** Write the enriched data to a *new file*, `llms_metadata_enriched.json`.

**7. Key Considerations:**

*   **API Endpoint:** Confirm the exact Cloudflare API method for retrieving individual domain intelligence.
*   **Data Fields:** Verify the path to category names (`result.content_categories`) in the actual response. Organization info might require separate investigation or may not be consistently available.
*   **Rate Limits:** Adhere to Cloudflare's API usage policies.