import type { APIRoute } from 'astro';
// Attempt to import the JSON data directly.
// If this causes issues in Astro's build/runtime, alternative file reading might be needed.
import llmsData from '../../data/llms_metadata.json';

interface LlmMetadata {
  url: string;
  domain: string;
  title: string;
  summary: string;
  last_updated: string;
  // Add other potential fields if they exist in the JSON
}

// Type assertion for the imported data
const allLlms: LlmMetadata[] = llmsData as LlmMetadata[];

export const GET: APIRoute = ({ url }) => {
  const params = url.searchParams;

  // --- 1. Get and Validate Parameters ---
  const query = params.get('q');
  const fileType = params.get('fileType') || 'both';
  const pageParam = params.get('page');
  const limitParam = params.get('limit');

  // Validate 'q' parameter
  if (!query || query.trim() === '') {
    return new Response(JSON.stringify({ error: 'Missing or empty search query parameter "q".' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate 'fileType' parameter
  const validFileTypes = ['llms.txt', 'llms-full.txt', 'both'];
  if (!validFileTypes.includes(fileType)) {
    return new Response(JSON.stringify({ error: `Invalid fileType parameter. Allowed values: ${validFileTypes.join(', ')}.` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate and parse 'page' and 'limit' parameters
  let page = 1;
  if (pageParam) {
    const parsedPage = parseInt(pageParam, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    } else {
       return new Response(JSON.stringify({ error: 'Invalid page parameter. Must be a positive integer.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  let limit = 10;
  if (limitParam) {
     const parsedLimit = parseInt(limitParam, 10);
     if (!isNaN(parsedLimit) && parsedLimit > 0) {
       limit = Math.min(parsedLimit, 50); // Apply max limit of 50
     } else {
        return new Response(JSON.stringify({ error: 'Invalid limit parameter. Must be a positive integer.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
     }
  }


  try {
    // --- 2. Filter and Search ---
    // As discussed, the 'fileType' parameter's application to a single JSON is ambiguous.
    // This implementation searches all records regardless of 'fileType',
    // but the parameter itself is validated above.
    // If 'fileType' needs to map to a specific field in llms_metadata.json,
    // this filtering logic would need adjustment.

    const lowerCaseQuery = query.toLowerCase();
    const filteredResults = allLlms.filter(llm =>
      (llm.title && llm.title.toLowerCase().includes(lowerCaseQuery)) ||
      (llm.summary && llm.summary.toLowerCase().includes(lowerCaseQuery))
    );

    // --- 3. Paginate ---
    const totalResults = filteredResults.length;
    const startIndex = (page - 1) * limit;
    // Ensure startIndex is not out of bounds
    if (startIndex >= totalResults && totalResults > 0) {
       return new Response(JSON.stringify({ error: 'Page number out of range.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const paginatedResults = filteredResults.slice(startIndex, startIndex + limit);

    // --- 4. Format Response ---
    const responseBody = {
      totalResults: totalResults,
      page: page,
      limit: limit,
      results: paginatedResults,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error processing search request:", error);
    // Log the specific error for server-side debugging
    let errorMessage = 'Internal Server Error processing search request.';
    if (error instanceof Error) {
        errorMessage = `Internal Server Error: ${error.message}`;
    }
     // Avoid exposing detailed internal errors to the client
    return new Response(JSON.stringify({ error: 'Internal Server Error processing search request.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};