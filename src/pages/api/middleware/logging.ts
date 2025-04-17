import type { APIContext, APIRoute } from 'astro';
import { v4 as uuidv4 } from 'uuid';

// Define log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Define log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  requestPath?: string;
  requestMethod?: string;
  requestIp?: string;
  userAgent?: string;
  statusCode?: number;
  responseTime?: number;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
    code?: string | number;
  };
  additionalData?: Record<string, any>;
}

// Define suspicious activity patterns
const SUSPICIOUS_PATTERNS = [
  /(\b)(select|update|insert|delete|drop|alter|create|truncate)(\s+)/i, // SQL injection attempts
  /<script\b[^>]*>(.*?)<\/script>/i, // XSS attempts
  /\.\.\//g, // Path traversal attempts
  /\b(admin|root|administrator)\b/i, // Admin access attempts
];

/**
 * Generates a correlation ID for request tracing
 * @returns A unique correlation ID
 */
export function generateCorrelationId(): string {
  return uuidv4();
}

/**
 * Creates a structured log entry
 * @param level Log level
 * @param message Log message
 * @param context Additional context data
 * @returns Structured log entry
 */
export function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context
  };
}

/**
 * Logs a structured entry to the console
 * @param entry Log entry to log
 */
export function logEntry(entry: LogEntry): void {
  // Convert to JSON string for structured logging
  const logString = JSON.stringify(entry);
  
  // Log to appropriate console method based on level
  switch (entry.level) {
    case LogLevel.DEBUG:
      console.debug(logString);
      break;
    case LogLevel.INFO:
      console.info(logString);
      break;
    case LogLevel.WARN:
      console.warn(logString);
      break;
    case LogLevel.ERROR:
    case LogLevel.CRITICAL:
      console.error(logString);
      break;
    default:
      console.log(logString);
  }
  
  // If this is a critical error, we could trigger additional alerting here
  if (entry.level === LogLevel.CRITICAL) {
    alertOnCriticalError(entry);
  }
}

/**
 * Checks if a request contains suspicious patterns
 * @param context API context
 * @returns True if suspicious patterns are detected
 */
export function detectSuspiciousActivity(context: APIContext): boolean {
  const url = context.url.toString();
  const method = context.request.method;
  const userAgent = context.request.headers.get('user-agent') || '';
  
  // Check URL and user agent for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url) || pattern.test(userAgent)) {
      return true;
    }
  }
  
  // Additional checks could be added here
  
  return false;
}

/**
 * Alert function for critical errors (stub for future integration)
 * @param entry Log entry for the critical error
 */
function alertOnCriticalError(entry: LogEntry): void {
  // This is a stub for future integration with notification services
  // In a production environment, this would send alerts via email, SMS, Slack, etc.
  console.error('CRITICAL ERROR ALERT:', entry);
  
  // Example integration with notification service:
  // notificationService.sendAlert({
  //   title: `Critical API Error: ${entry.message}`,
  //   message: JSON.stringify(entry, null, 2),
  //   level: 'critical'
  // });
}

/**
 * Alert function for suspicious activity (stub for future integration)
 * @param context API context
 * @param correlationId Correlation ID for the request
 */
function alertOnSuspiciousActivity(context: APIContext, correlationId: string): void {
  // This is a stub for future integration with security monitoring services
  const suspiciousEntry = createLogEntry(
    LogLevel.WARN,
    'Suspicious activity detected',
    {
      correlationId,
      requestPath: context.url.pathname,
      requestMethod: context.request.method,
      requestIp: context.request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: context.request.headers.get('user-agent') || 'unknown',
      additionalData: {
        query: Object.fromEntries(context.url.searchParams.entries()),
        headers: Object.fromEntries(
          Array.from(context.request.headers.entries())
            .filter(([key]) => !['cookie', 'authorization'].includes(key.toLowerCase()))
        )
      }
    }
  );
  
  logEntry(suspiciousEntry);
  
  // Example integration with security service:
  // securityService.reportSuspiciousActivity({
  //   correlationId,
  //   requestDetails: {
  //     path: context.url.pathname,
  //     method: context.request.method,
  //     ip: context.request.headers.get('x-forwarded-for') || 'unknown',
  //     userAgent: context.request.headers.get('user-agent') || 'unknown'
  //   },
  //   timestamp: new Date().toISOString()
  // });
}

/**
 * Stub for Cloudflare Analytics integration
 * @param context API context
 * @param responseTime Response time in milliseconds
 * @param statusCode HTTP status code
 */
function logToCloudflareAnalytics(
  context: APIContext,
  responseTime: number,
  statusCode: number
): void {
  // This is a stub for future integration with Cloudflare Analytics
  // In a production environment, this would send data to Cloudflare
  
  // Example integration:
  // cloudflareAnalytics.logRequest({
  //   path: context.url.pathname,
  //   method: context.request.method,
  //   statusCode,
  //   responseTime,
  //   userAgent: context.request.headers.get('user-agent') || 'unknown',
  //   timestamp: new Date().toISOString()
  // });
}

/**
 * Middleware for request logging and monitoring
 * @returns Middleware function that logs requests and responses
 */
export function logRequest(): (next: APIRoute) => APIRoute {
  return (next: APIRoute) => {
    return async (context: APIContext) => {
      // Generate correlation ID for request tracing
      const correlationId = generateCorrelationId();
      
      // Record request start time
      const startTime = performance.now();
      
      // Log request
      logEntry(createLogEntry(
        LogLevel.INFO,
        `API Request: ${context.request.method} ${context.url.pathname}`,
        {
          correlationId,
          requestPath: context.url.pathname,
          requestMethod: context.request.method,
          requestIp: context.request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: context.request.headers.get('user-agent') || 'unknown',
          additionalData: {
            query: Object.fromEntries(context.url.searchParams.entries())
          }
        }
      ));
      
      // Check for suspicious activity
      if (detectSuspiciousActivity(context)) {
        alertOnSuspiciousActivity(context, correlationId);
      }
      
      try {
        // Add correlation ID to request headers for tracing
        const modifiedRequest = new Request(context.request.url, {
          method: context.request.method,
          headers: new Headers(context.request.headers),
          body: context.request.body,
          redirect: context.request.redirect,
          integrity: context.request.integrity,
          signal: context.request.signal
        });
        modifiedRequest.headers.set('X-Correlation-ID', correlationId);
        
        // Create a new context with the modified request
        const modifiedContext = { ...context, request: modifiedRequest, correlationId };
        
        // Call the next handler
        const response = await next(modifiedContext);
        
        // Calculate response time
        const responseTime = performance.now() - startTime;
        
        // Add correlation ID to response headers
        const modifiedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        modifiedResponse.headers.set('X-Correlation-ID', correlationId);
        
        // Log response
        logEntry(createLogEntry(
          LogLevel.INFO,
          `API Response: ${context.request.method} ${context.url.pathname} ${response.status}`,
          {
            correlationId,
            requestPath: context.url.pathname,
            requestMethod: context.request.method,
            statusCode: response.status,
            responseTime,
            additionalData: {
              contentType: response.headers.get('content-type') || 'unknown'
            }
          }
        ));
        
        // Log to Cloudflare Analytics (stub)
        logToCloudflareAnalytics(context, responseTime, response.status);
        
        return modifiedResponse;
      } catch (error) {
        // Calculate response time even for errors
        const responseTime = performance.now() - startTime;
        
        // Create structured error object
        const errorObj = {
          name: error instanceof Error ? error.name : 'Unknown Error',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          code: error instanceof Error && 'code' in error ? (error as any).code : undefined
        };
        
        // Log error
        logEntry(createLogEntry(
          LogLevel.ERROR,
          `API Error: ${context.request.method} ${context.url.pathname}`,
          {
            correlationId,
            requestPath: context.url.pathname,
            requestMethod: context.request.method,
            requestIp: context.request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: context.request.headers.get('user-agent') || 'unknown',
            responseTime,
            error: errorObj,
            additionalData: {
              query: Object.fromEntries(context.url.searchParams.entries())
            }
          }
        ));
        
        // Create error response with correlation ID
        const errorResponse = new Response(
          JSON.stringify({ error: 'Internal Server Error', correlationId }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'X-Correlation-ID': correlationId
            }
          }
        );
        
        // Log to Cloudflare Analytics (stub)
        logToCloudflareAnalytics(context, responseTime, 500);
        
        return errorResponse;
      }
    };
  };
}