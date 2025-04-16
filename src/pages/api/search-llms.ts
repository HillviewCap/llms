import type { APIRoute } from 'astro';
import llmsData from '../../data/llms_metadata.json';

interface LlmMetadata {
  url: string;
  domain: string;
  title: string;
  summary: string;
  last_updated: string;
}

// Type assertion for the imported data
const allLlms: LlmMetadata[] = llmsData as LlmMetadata[];

// For static mode, explicitly opt out of prerendering
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // In SSR mode, we can directly access the request URL
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    // Debug information
    console.log('Processing request URL:', request.url);
    console.log('Query parameter:', query);
    
    // If no query parameter was found, return an error
    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({
          error: 'Missing or empty search query parameter "q".',
          requestUrl: request.url
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Process the search with the extracted query
    const lowerCaseQuery = query.toLowerCase();
    const filteredResults = allLlms.filter(llm =>
      (llm.title && llm.title.toLowerCase().includes(lowerCaseQuery)) ||
      (llm.summary && llm.summary.toLowerCase().includes(lowerCaseQuery))
    );
    
    // Get pagination parameters
    const pageParam = url.searchParams.get('page');
    const limitParam = url.searchParams.get('limit');
    
    // Parse pagination parameters
    let page = 1;
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        page = parsedPage;
      }
    }
    
    let limit = 10;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, 50); // Apply max limit of 50
      }
    }
    
    // Paginate results
    const totalResults = filteredResults.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = filteredResults.slice(startIndex, startIndex + limit);
    
    // Format response
    const responseBody = {
      totalResults: totalResults,
      page: page,
      limit: limit,
      results: paginatedResults
    };
    
    return new Response(
      JSON.stringify(responseBody),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    console.error("Error processing search request:", error);
    let errorMessage = 'Internal Server Error processing search request.';
    if (error instanceof Error) {
      errorMessage = `Internal Server Error: ${error.message}`;
    }
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        requestUrl: request.url
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};