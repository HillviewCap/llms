import type { APIContext, APIRoute } from 'astro';

// Extend APIContext to include sanitizedParams
declare module 'astro' {
  interface APIContext {
    sanitizedParams?: Record<string, any>;
  }
}

// Define interface for validation schema
export interface ValidationSchema {
  type: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  enum?: string[] | number[];
  sanitize?: (value: any) => any;
}

// Define interface for validation rules
export interface ValidationRules {
  [key: string]: ValidationSchema;
}

// Define interface for validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedParams: Record<string, any>;
}

// Maximum request body size (10KB)
const MAX_REQUEST_SIZE = 10 * 1024;

/**
 * Validates and sanitizes query parameters based on a schema
 * @param params URLSearchParams object containing query parameters
 * @param schema Validation schema for the parameters
 * @returns Validation result with errors and sanitized parameters
 */
export function validateQueryParams(
  params: URLSearchParams,
  schema: ValidationRules
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    sanitizedParams: {},
  };

  // Check each parameter against the schema
  for (const [paramName, rules] of Object.entries(schema)) {
    const paramValue = params.get(paramName);

    // Check if required parameter is missing
    if (rules.required && (paramValue === null || paramValue === '')) {
      result.errors.push(`Missing or empty required parameter "${paramName}"`);
      result.valid = false;
      continue;
    }

    // Skip validation for optional parameters that are not provided
    if (paramValue === null) {
      continue;
    }

    let sanitizedValue: any = paramValue;

    // Type validation and conversion
    switch (rules.type) {
      case 'number':
        const num = Number(paramValue);
        if (isNaN(num)) {
          result.errors.push(`Parameter "${paramName}" must be a valid number`);
          result.valid = false;
          continue;
        }
        sanitizedValue = num;

        // Check min/max constraints for numbers
        if (rules.min !== undefined && sanitizedValue < rules.min) {
          result.errors.push(`Parameter "${paramName}" must be at least ${rules.min}`);
          result.valid = false;
        }
        if (rules.max !== undefined && sanitizedValue > rules.max) {
          result.errors.push(`Parameter "${paramName}" must be at most ${rules.max}`);
          result.valid = false;
        }
        
        // DEBUG: Log number conversion
        console.debug(`DEBUG: Number parameter "${paramName}" converted:`, {
          original: paramValue,
          converted: sanitizedValue,
          type: typeof sanitizedValue
        });
        break;

      case 'string':
        // Check string length constraints
        if (rules.minLength !== undefined && paramValue.length < rules.minLength) {
          result.errors.push(`Parameter "${paramName}" must be at least ${rules.minLength} characters long`);
          result.valid = false;
        }
        if (rules.maxLength !== undefined && paramValue.length > rules.maxLength) {
          result.errors.push(`Parameter "${paramName}" must be at most ${rules.maxLength} characters long`);
          result.valid = false;
        }
        // Check pattern constraint
        if (rules.pattern && !rules.pattern.test(paramValue)) {
          result.errors.push(`Parameter "${paramName}" has an invalid format`);
          result.valid = false;
        }
        break;

      case 'boolean':
        if (paramValue !== 'true' && paramValue !== 'false') {
          result.errors.push(`Parameter "${paramName}" must be either "true" or "false"`);
          result.valid = false;
        } else {
          sanitizedValue = paramValue === 'true';
        }
        break;

      case 'array':
        try {
          // Assume array is comma-separated values
          sanitizedValue = paramValue.split(',').map(item => item.trim());
        } catch (e) {
          result.errors.push(`Parameter "${paramName}" must be a valid comma-separated list`);
          result.valid = false;
        }
        break;
    }

    // Check enum constraint
    if (rules.enum && Array.isArray(rules.enum)) {
      const isValidEnum = rules.enum.some(item => item === sanitizedValue);
      if (!isValidEnum) {
        result.errors.push(`Parameter "${paramName}" must be one of: ${rules.enum.join(', ')}`);
        result.valid = false;
      }
    }

    // Apply custom sanitization if provided
    if (rules.sanitize && result.valid) {
      try {
        const beforeSanitize = sanitizedValue;
        sanitizedValue = rules.sanitize(sanitizedValue);
        
        // DEBUG: Log sanitization
        console.debug(`DEBUG: Parameter "${paramName}" sanitized:`, {
          before: beforeSanitize,
          after: sanitizedValue,
          typeBefore: typeof beforeSanitize,
          typeAfter: typeof sanitizedValue
        });
      } catch (e) {
        result.errors.push(`Failed to sanitize parameter "${paramName}"`);
        result.valid = false;
      }
    }

    // Add sanitized value to result
    result.sanitizedParams[paramName] = sanitizedValue;
  }

  return result;
}

/**
 * Validates request body size to prevent DoS attacks
 * @param request Request object
 * @returns True if request size is within limits, false otherwise
 */
export async function validateRequestSize(request: Request): Promise<boolean> {
  // Check Content-Length header if available
  const contentLength = request.headers.get('Content-Length');
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
    return false;
  }

  // If Content-Length is not available or not reliable, check actual body size
  if (request.body) {
    try {
      const reader = request.body.getReader();
      let totalSize = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        totalSize += value.length;
        if (totalSize > MAX_REQUEST_SIZE) {
          return false;
        }
      }
    } catch (error) {
      // If we can't read the body, assume it's invalid
      return false;
    }
  }

  return true;
}

/**
 * Middleware for validating API requests
 * @param schema Validation schema for request parameters
 * @returns Middleware function that validates requests
 */
export function validateRequest(schema: ValidationRules): (next: APIRoute) => APIRoute {
  return (next: APIRoute) => {
    return async (context: APIContext) => {
      // DEBUG: Log the raw query parameters
      console.debug(`DEBUG: Raw query parameters:`,
        Object.fromEntries(context.url.searchParams.entries())
      );
      
      // Validate request size for POST, PUT, PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(context.request.method)) {
        const isValidSize = await validateRequestSize(context.request);
        if (!isValidSize) {
          console.debug(`DEBUG: Request size validation failed`);
          return new Response(
            JSON.stringify({ error: 'Request body exceeds maximum allowed size' }),
            {
              status: 413, // Payload Too Large
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }

      // Validate query parameters
      const validationResult = validateQueryParams(context.url.searchParams, schema);
      
      // DEBUG: Log the validation result
      console.debug(`DEBUG: Validation result:`, {
        valid: validationResult.valid,
        errors: validationResult.errors,
        sanitizedParams: validationResult.sanitizedParams
      });
      
      if (!validationResult.valid) {
        return new Response(
          JSON.stringify({ error: 'Validation failed', details: validationResult.errors }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Add sanitized parameters to the context for the next handler
      context.sanitizedParams = validationResult.sanitizedParams;
      
      // DEBUG: Log the context with sanitized parameters
      console.debug(`DEBUG: Context with sanitized parameters:`, {
        sanitizedParams: context.sanitizedParams,
        url: context.url.toString(),
        method: context.request.method
      });
      
      // Call the next handler
      return next(context);
    };
  };
}