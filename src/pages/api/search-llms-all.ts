import type { APIRoute } from 'astro';
// Import the data the same way as the working search-llms API
import llmsData from '../../data/llms_metadata.json';

// Define interface to match the structure
interface LlmMetadataItem {
  url: string;
  domain: string;
  content_hash: string;
  last_checked_utc: string;
  title: string;
  summary?: string;
  quality?: string;
  metadata: {
    source_domain: string;
    url_purpose_ranking: string[];
    url_topic_ranking: [string, number][];
    domain_purpose_ranking: string[];
    domain_topic_ranking: [string, number][];
    url_token_count?: number;
    previous_url_token_count?: number;
  };
  first_added: string;
  last_updated: string;
  previous_content_hash?: string;
}

interface LlmsDataRecord {
  [domain: string]: LlmMetadataItem;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    // Convert the object structure to an array for easier processing (same as search-llms API)
    const llmsDataObject: LlmsDataRecord = llmsData as unknown as LlmsDataRecord;
    const allLlms: LlmMetadataItem[] = Object.values(llmsDataObject);

    // Transform the data to grouped format
    const domainMap = new Map();

    // The data structure is different - each entry is already a complete record
    // We need to group by domain and handle llms.txt vs llms-full.txt URLs
    allLlms.forEach((entryData: LlmMetadataItem) => {
      try {
        const domain = entryData.domain;
        const url = entryData.url;
        
        // Determine file type from URL
        const fileType = url.includes("llms-full.txt") ? "llmsFull" : "llms";
        
        if (!domainMap.has(domain)) {
          domainMap.set(domain, {
            domain,
            name: domain,
            urls: {},
            titles: {},
            qualities: {},
            entries: {},
            title: null,
            quality: null,
            url: null,
            content_hash: null,
            previous_content_hash: null,
            metadata: {},
            last_updated: null,
            first_added: null,
            description: "",
          });
        }
        
        const entry = domainMap.get(domain);
        entry.urls[fileType] = entryData.url;
        entry.titles[fileType] = entryData.title;
        entry.qualities[fileType] = entryData.quality;
        entry.entries[fileType] = entryData;

        // Set primary data from llms.txt if available, otherwise from llms-full.txt
        if (fileType === "llms" || !entry.title) {
          entry.title = entryData.title || "";
          entry.quality = entryData.quality;
          entry.url = entryData.url;
          entry.content_hash = entryData.content_hash;
          entry.previous_content_hash = entryData.previous_content_hash;
        }

        // Set metadata from llms.txt preferentially
        if (fileType === "llms") {
          entry.metadata = entryData.metadata || {};
          entry.last_updated = entryData.last_updated;
          entry.first_added = entryData.first_added;
          entry.description = entryData.summary || "";
        }
        
        // If llms-full.txt and no metadata from llms.txt yet
        if (fileType === "llmsFull" && (!entry.metadata || Object.keys(entry.metadata).length === 0)) {
          entry.metadata = entryData.metadata || {};
          entry.last_updated = entryData.last_updated;
          entry.first_added = entryData.first_added;
          entry.description = entryData.summary || "";
        }
      } catch (error) {
        console.error(`Error processing entry for domain ${entryData.domain}:`, error);
      }
    });

    // Convert to array and sort by last_updated
    const result = Array.from(domainMap.values()).sort((a, b) => {
      return new Date(b.last_updated || 0).getTime() - new Date(a.last_updated || 0).getTime();
    });

    return new Response(JSON.stringify({
      success: true,
      count: result.length,
      data: result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('Error in search-llms-all API:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to load data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};