import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Import the data dynamically to avoid bundling issues
    const llmsData = await import('../../data/llms_metadata.json');
    const data = llmsData.default || llmsData;

    // Transform the data to grouped format
    const domainMap = new Map();

    Object.entries(data).forEach(([key, entryData]: [string, any]) => {
      try {
        const urlObj = new URL(key);
        const domain = urlObj.hostname;

        const fileType = key.includes("llms-full.txt") ? "llmsFull" : "llms";
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

        if (fileType === "llms" || !entry.title) {
          entry.title = entryData.title || "";
          entry.quality = entryData.quality;
          entry.url = entryData.url;
          entry.content_hash = entryData.content_hash;
        }

        if (fileType === "llms") {
          entry.metadata = entryData.metadata || {};
          entry.last_updated = entryData.last_updated;
          entry.first_added = entryData.first_added;
          entry.description = entryData.summary || entryData.description || "";
        }
        
        if (fileType === "llmsFull" && (!entry.metadata || Object.keys(entry.metadata).length === 0)) {
          entry.metadata = entryData.metadata || {};
          entry.last_updated = entryData.last_updated;
          entry.first_added = entryData.first_added;
          entry.description = entryData.summary || entryData.description || "";
        }
      } catch (error) {
        console.error(`Error processing entry ${key}:`, error);
      }
    });

    // Convert to array and sort
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