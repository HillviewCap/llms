import type { APIContext, APIRoute } from 'astro';
// Attempt to import the JSON data directly.
// If this causes issues in Astro's build/runtime, alternative file reading might be needed.
import llmsData from '../../data/llms_metadata.json';
import { validateRequest } from '../api/middleware/validation';
import type { ValidationRules } from '../api/middleware/validation';
import { logRequest, LogLevel, createLogEntry, logEntry } from '../api/middleware/logging';
import { createSecureJsonResponse, createSecureErrorResponse } from '../api/utils/security-headers';

// Define interface to match the updated structure of the imported data
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

// Define interface for the new JSON structure
interface LlmsDataRecord {
  [domain: string]: LlmMetadataItem;
}

// Convert the object structure to an array for easier processing
const llmsDataObject: LlmsDataRecord = llmsData as unknown as LlmsDataRecord;
const allLlms: LlmMetadataItem[] = Object.values(llmsDataObject);

// Log data structure for debugging
logEntry(createLogEntry(
  LogLevel.DEBUG,
  `Loaded ${allLlms.length} records from metadata JSON`,
  {
    additionalData: {
      sampleKeys: Object.keys(llmsDataObject).slice(0, 3),
      dataFormat: typeof llmsDataObject
    }
  }
));

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
  const { q: query, fileType } = context.sanitizedParams || {};
  
  // Ensure page and limit have default values
  const page = context.sanitizedParams?.page || 1;
  const limit = context.sanitizedParams?.limit || 10;

  // DEBUG: Log the sanitized parameters
  logEntry(createLogEntry(
    LogLevel.DEBUG,
    `DEBUG: Sanitized parameters received in handler`,
    {
      correlationId: context.request.headers.get('X-Correlation-ID') || undefined,
      additionalData: {
        sanitizedParams: context.sanitizedParams,
        rawQuery: context.url.searchParams.get('q'),
        rawFileType: context.url.searchParams.get('fileType'),
        rawPage: context.url.searchParams.get('page'),
        rawLimit: context.url.searchParams.get('limit')
      }
    }
  ));

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

    // DEBUG: Log the imported data
    logEntry(createLogEntry(
      LogLevel.DEBUG,
      `DEBUG: Imported LLMs data`,
      {
        correlationId: context.request.headers.get('X-Correlation-ID') || undefined,
        additionalData: {
          totalImportedItems: allLlms.length,
          sampleItem: allLlms.length > 0 ? allLlms[0] : null
        }
      }
    ));

    const lowerCaseQuery = query.toLowerCase();
    
    // DEBUG: Log the search query being used
    logEntry(createLogEntry(
      LogLevel.DEBUG,
      `DEBUG: Using search query: "${lowerCaseQuery}"`,
      {
        correlationId: context.request.headers.get('X-Correlation-ID') || undefined
      }
    ));
    
    const filteredResults = allLlms.filter(llm => {
      // Search in domain and URL
      const domainMatch = llm.domain && llm.domain.toLowerCase().includes(lowerCaseQuery);
      const urlMatch = llm.url && llm.url.toLowerCase().includes(lowerCaseQuery);
      
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
        
        // Check purpose rankings
        if (llm.metadata.url_purpose_ranking) {
          for (const purpose of llm.metadata.url_purpose_ranking) {
            if (purpose.toLowerCase().includes(lowerCaseQuery)) {
              metadataMatch = true;
              break;
            }
          }
        }
        
        if (llm.metadata.domain_purpose_ranking) {
          for (const purpose of llm.metadata.domain_purpose_ranking) {
            if (purpose.toLowerCase().includes(lowerCaseQuery)) {
              metadataMatch = true;
              break;
            }
          }
        }
      }
      
      const isMatch = domainMatch || urlMatch || titleMatch || summaryMatch || metadataMatch;
      
      // DEBUG: Log a sample of matches and non-matches (without referencing filteredResults)
      if ((isMatch && Math.random() < 0.1) || (!isMatch && Math.random() < 0.01)) {
        logEntry(createLogEntry(
          LogLevel.DEBUG,
          `DEBUG: Item match result: ${isMatch ? 'MATCH' : 'NO MATCH'}`,
          {
            correlationId: context.request.headers.get('X-Correlation-ID') || undefined,
            additionalData: {
              title: llm.title,
              titleMatch,
              summaryMatch,
              metadataMatch
            }
          }
        ));
      }
      
      return isMatch;
    });

    // --- 3. Paginate ---
    const totalResults = filteredResults.length;
    
    // DEBUG: Log filtered results before pagination
    logEntry(createLogEntry(
      LogLevel.DEBUG,
      `DEBUG: Filtered results before pagination`,
      {
        correlationId: context.request.headers.get('X-Correlation-ID') || undefined,
        additionalData: {
          totalFilteredResults: totalResults,
          sampleFilteredItem: filteredResults.length > 0 ? filteredResults[0].title : null
        }
      }
    ));
    
    // DEBUG: Log page and limit values
    logEntry(createLogEntry(
      LogLevel.DEBUG,
      `DEBUG: Pagination parameters`,
      {
        correlationId: context.request.headers.get('X-Correlation-ID') || undefined,
        additionalData: {
          page,
          limit,
          pageType: typeof page,
          limitType: typeof limit
        }
      }
    ));
    
    // Ensure page and limit are numbers
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const startIndex = (pageNum - 1) * limitNum;
    
    // Ensure startIndex is not out of bounds
    if (startIndex >= totalResults && totalResults > 0) {
      return createSecureErrorResponse('Page number out of range.', 400);
    }
    
    const paginatedResults = filteredResults.slice(startIndex, startIndex + limitNum);
    
    // DEBUG: Log paginated results
    logEntry(createLogEntry(
      LogLevel.DEBUG,
      `DEBUG: Paginated results`,
      {
        correlationId: context.request.headers.get('X-Correlation-ID') || undefined,
        additionalData: {
          startIndex,
          endIndex: startIndex + limitNum,
          paginatedResultsCount: paginatedResults.length,
          paginatedResultsTitles: paginatedResults.map(item => item.title)
        }
      }
    ));
    
    // Format response
    const responseBody = {
      totalResults: totalResults,
      page: pageNum,
      limit: limitNum,
      results: paginatedResults
    };

    // DEBUG: Log final response body
    logEntry(createLogEntry(
      LogLevel.DEBUG,
      `DEBUG: Final response body`,
      {
        correlationId: context.request.headers.get('X-Correlation-ID') || undefined,
        additionalData: {
          totalResults: responseBody.totalResults,
          resultsLength: responseBody.results.length
        }
      }
    ));

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