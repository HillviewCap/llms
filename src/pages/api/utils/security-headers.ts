/**
 * Security headers utility for API responses
 * Provides functions to add security headers to API responses
 */

// Default Content Security Policy directives
const DEFAULT_CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

// Interface for CSP directives
export interface CSPDirectives {
  [key: string]: string[];
}

/**
 * Generates a Content-Security-Policy header value from directives
 * @param directives CSP directives object
 * @returns Formatted CSP header value
 */
export function generateCSP(directives: CSPDirectives = DEFAULT_CSP_DIRECTIVES): string {
  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Security headers to be applied to all API responses
 * @param customCSP Optional custom CSP directives to merge with defaults
 * @returns Object containing security headers
 */
export function getSecurityHeaders(customCSP?: CSPDirectives): Record<string, string> {
  // Merge custom CSP directives with defaults if provided
  const cspDirectives = customCSP
    ? { ...DEFAULT_CSP_DIRECTIVES, ...customCSP }
    : DEFAULT_CSP_DIRECTIVES;

  return {
    'Content-Security-Policy': generateCSP(cspDirectives),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
  };
}

/**
 * Applies security headers to a Response object
 * @param response Response object to add headers to
 * @param customCSP Optional custom CSP directives
 * @returns Response with security headers added
 */
export function applySecurityHeaders(
  response: Response,
  customCSP?: CSPDirectives
): Response {
  const headers = getSecurityHeaders(customCSP);
  
  // Create a new response with the same status, body, and existing headers
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
  
  // Add security headers
  Object.entries(headers).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  
  return newResponse;
}

/**
 * Creates a new Response with security headers
 * @param body Response body
 * @param options Response options
 * @param customCSP Optional custom CSP directives
 * @returns Response with security headers
 */
export function createSecureResponse(
  body: BodyInit | null,
  options?: ResponseInit,
  customCSP?: CSPDirectives
): Response {
  const response = new Response(body, options);
  return applySecurityHeaders(response, customCSP);
}

/**
 * Creates a JSON response with security headers
 * @param data Data to be JSON stringified
 * @param status HTTP status code
 * @param customCSP Optional custom CSP directives
 * @returns Secure JSON response
 */
export function createSecureJsonResponse(
  data: any,
  status: number = 200,
  customCSP?: CSPDirectives
): Response {
  // DEBUG: Log the data being sent in the response
  console.debug(`DEBUG: Creating secure JSON response:`, {
    status,
    dataType: typeof data,
    isArray: Array.isArray(data),
    hasResults: data && data.results ? `Results array length: ${data.results.length}` : 'No results property',
    totalResults: data && data.totalResults !== undefined ? data.totalResults : 'No totalResults property'
  });
  
  const jsonString = JSON.stringify(data);
  
  // DEBUG: Log the stringified JSON
  console.debug(`DEBUG: JSON string length: ${jsonString.length}`);
  
  return createSecureResponse(
    jsonString,
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    },
    customCSP
  );
}

/**
 * Creates an error response with security headers
 * @param message Error message
 * @param status HTTP status code
 * @param customCSP Optional custom CSP directives
 * @returns Secure error response
 */
export function createSecureErrorResponse(
  message: string,
  status: number = 400,
  customCSP?: CSPDirectives
): Response {
  return createSecureJsonResponse(
    { error: message },
    status,
    customCSP
  );
}