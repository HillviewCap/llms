import type { APIContext, APIRoute } from 'astro';
// Attempt to import the JSON data directly.
// If this causes issues in Astro's build/runtime, alternative file reading might be needed.
import llmsData from '../../data/llms_metadata.json';
import { validateRequest } from '../api/middleware/validation';
import type { ValidationRules } from '../api/middleware/validation';
import { logRequest, LogLevel, createLogEntry, logEntry } from '../api/middleware/logging';
import { createSecureJsonResponse, createSecureErrorResponse } from '../api/utils/security-headers';

// Define interface to match the actual structure of the imported data
interface LlmMetadata {
  url: string;
  domain: string;
  title: string;
  summary: string;
  last_updated?: string;
  last_checked_utc?: string;
  content_hash?: string;
  quality?: string;
  first_added?: string;
  // Add other potential fields if they exist in the JSON
  metadata?: {
    source_domain?: string;
    url_purpose_ranking?: string[];
    url_topic_ranking?: [string, number][];
    domain_purpose_ranking?: string[];
    domain_topic_ranking?: [string, number][];
  };
}

// Type assertion for the imported data
const allLlms: LlmMetadata[] = llmsData as unknown as LlmMetadata[];

// Define validation schema for search parameters
const searchValidationSchema: ValidationRules = {
  q: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    sanitize: (value: string) => value.trim()
  },
  fileType: {
    type: 'string',
    required: false,
    enum: ['llms.txt', 'llms-full.txt', 'both'],
    sanitize: (value: string) => value || 'both'
  },
  page: {
    type: 'number',
    required: false,
    min: 1,
    sanitize: (value: number) => value || 1
  },
  limit: {
    type: 'number',
    required: false,
    min: 1,
    max: 50,
    sanitize: (value: number) => value ? Math.min(value, 50) : 10
  }
};

// Create the handler function
const searchHandler = async (context: APIContext) => {
  // Get sanitized parameters from the validation middleware
  const { q: query, fileType, page, limit } = context.sanitizedParams || {};

  try {
    // Log detailed search information
    logEntry(createLogEntry(
      LogLevel.INFO,
      `Search query executed: ${query}`,
      {
        correlationId: context.request.headers.get('X-Correlation-ID') || undefined,
        additionalData: {
          query,
          fileType,
          page,
          limit
        }
      }
    ));

    // --- 2. Filter and Search ---
    // As discussed, the 'fileType' parameter's application to a single JSON is ambiguous.
    // This implementation searches all records regardless of 'fileType',
    // but the parameter itself is validated above.
    // If 'fileType' needs to map to a specific field in llms_metadata.json,
    // this filtering logic would need adjustment.

    const lowerCaseQuery = query.toLowerCase();
    const filteredResults = allLlms.filter(llm => {
      // Search in title and summary
      const titleMatch = llm.title && llm.title.toLowerCase().includes(lowerCaseQuery);
      const summaryMatch = llm.summary && llm.summary.toLowerCase().includes(lowerCaseQuery);
      
      // Search in metadata if available
      let metadataMatch = false;
      if (llm.metadata) {
        // Check domain
        if (llm.metadata.source_domain &&
            llm.metadata.source_domain.toLowerCase().includes(lowerCaseQuery)) {
          metadataMatch = true;
        }
        
        // Check topic rankings
        if (llm.metadata.url_topic_ranking) {
          for (const [topic] of llm.metadata.url_topic_ranking) {
            if (topic.toLowerCase().includes(lowerCaseQuery)) {
              metadataMatch = true;
              break;
            }
          }
        }
        
        if (llm.metadata.domain_topic_ranking) {
          for (const [topic] of llm.metadata.domain_topic_ranking) {
            if (topic.toLowerCase().includes(lowerCaseQuery)) {
              metadataMatch = true;
              break;
            }
          }
        }
      }
      
      return titleMatch || summaryMatch || metadataMatch;
    });

    // --- 3. Paginate ---
    const totalResults = filteredResults.length;
    const startIndex = (page - 1) * limit;
    
    // Ensure startIndex is not out of bounds
    if (startIndex >= totalResults && totalResults > 0) {
      return createSecureErrorResponse('Page number out of range.', 400);
    }
    
    const paginatedResults = filteredResults.slice(startIndex, startIndex + limit);

    // --- 4. Format Response ---
    const responseBody = {
      totalResults: totalResults,
      page: page,
      limit: limit,
      results: paginatedResults,
    };

    return createSecureJsonResponse(responseBody, 200);

  } catch (error) {
    // Error is already logged by the logging middleware
    let errorMessage = 'Internal Server Error processing search request.';
    if (error instanceof Error) {
      errorMessage = `Internal Server Error: ${error.message}`;
      
      // Log detailed error information
      logEntry(createLogEntry(
        LogLevel.ERROR,
        errorMessage,
        {
          correlationId: context.request.headers.get('X-Correlation-ID') || undefined,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        }
      ));
    }
    
    // Avoid exposing detailed internal errors to the client
    return createSecureErrorResponse('Internal Server Error processing search request.', 500);
  }
};

// Apply middleware to the route
export const GET: APIRoute = logRequest()(validateRequest(searchValidationSchema)(searchHandler));