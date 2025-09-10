// lib/input-validator.ts
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];

// Text validation constants
const MAX_TEXT_LENGTH = 5000;
const MAX_JOB_NAME_LENGTH = 100;
const MAX_JOB_DESCRIPTION_LENGTH = 2000;

// Validation error class
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Enhanced file validation function with additional security checks
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Please upload a PDF, Word document, or text file.' };
  }

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
    return { isValid: false, error: 'Invalid file extension. Please upload a PDF, Word document, or text file.' };
  }

  // Check for suspicious file names
  const fileName = file.name.toLowerCase();
  const suspiciousPatterns = [
    '..', // Directory traversal
    '/', // Path separator
    '\\', // Windows path separator
    '%00', // Null byte
  ];
  
  if (suspiciousPatterns.some(pattern => fileName.includes(pattern))) {
    return { isValid: false, error: 'Invalid file name. File name contains suspicious characters.' };
  }

  return { isValid: true };
}

// Enhanced text sanitization function with additional security measures
export function sanitizeText(text: string): string {
  // First, remove any null bytes which can be used for injection
  let sanitized = text.replace(/\0/g, '');
  
  // Remove any HTML tags and potentially dangerous content
  sanitized = sanitizeHtml(sanitized, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'escape',
  });

  // Remove any potentially dangerous characters and escape sequences
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/\$/g, '&#x24;')
    .replace(/\{/g, '&#x7B;')
    .replace(/\}/g, '&#x7D;')
    .replace(/\[/g, '&#x5B;')
    .replace(/\]/g, '&#x5D;')
    .replace(/\(/g, '&#x28;')
    .replace(/\)/g, '&#x29;');

  return sanitized;
}

// Enhanced text validation function with XSS and injection protection
export function validateText(text: string, maxLength: number = MAX_TEXT_LENGTH, skipSQLValidation: boolean = false): { isValid: boolean; error?: string; pattern?: string } {
  // Check if text exists
  if (text === undefined || text === null) {
    return { isValid: false, error: 'Text is required' };
  }

  // Check text length
  if (text.length > maxLength) {
    return { isValid: false, error: `Text exceeds maximum length of ${maxLength} characters` };
  }

  // Check for common XSS patterns
  const xssPatterns = [
    { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, name: 'script tag' },
    { pattern: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, name: 'iframe tag' },
    { pattern: /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, name: 'object tag' },
    { pattern: /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, name: 'embed tag' },
    { pattern: /javascript:/gi, name: 'javascript protocol' },
    { pattern: /vbscript:/gi, name: 'vbscript protocol' },
    { pattern: /onload=/gi, name: 'onload attribute' },
    { pattern: /onerror=/gi, name: 'onerror attribute' },
    { pattern: /onmouseover=/gi, name: 'onmouseover attribute' },
    { pattern: /onfocus=/gi, name: 'onfocus attribute' },
    { pattern: /onblur=/gi, name: 'onblur attribute' },
    { pattern: /onclick=/gi, name: 'onclick attribute' },
  ];

  for (const { pattern, name } of xssPatterns) {
    if (pattern.test(text)) {
      return { isValid: false, error: `Text contains potentially malicious content (${name})`, pattern: name };
    }
  }

  // Skip SQL validation for AI analysis since the text is already processed
  if (!skipSQLValidation) {
    // Check for SQL injection patterns - be more specific to avoid false positives with CV content
    const sqlPatterns = [
      { pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE)\b)/gi, name: 'SQL keywords' },
      // More specific patterns for SQL comments and terminators to avoid false positives with CV content
      { pattern: /--\s+[a-zA-Z]/g, name: 'SQL line comment' }, // Only flag if followed by space and text
      { pattern: /\/\*\s*[a-zA-Z]/g, name: 'SQL block comment start' }, // Only flag if followed by text
      { pattern: /[a-zA-Z0-9]\s*\*\//g, name: 'SQL block comment end' }, // Only flag if preceded by alphanumeric and space
      { pattern: /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE)\b/gi, name: 'SQL statement separator' }, // Only flag if followed by SQL keyword
    ];

    for (const { pattern, name } of sqlPatterns) {
      if (pattern.test(text)) {
        // For debugging in development, log what's being matched
        if (process.env.NODE_ENV === 'development') {
          const matches = text.match(new RegExp(pattern, 'gi'));
          console.log(`[Input Validator] SQL pattern "${name}" matched:`, matches?.slice(0, 5)); // Only show first 5 matches
        }
        return { isValid: false, error: `Text contains potentially malicious content (${name})`, pattern: name };
      }
    }
  }

  return { isValid: true };
}

// Specialized validation function for processed CV text that has already been sanitized
// This is more permissive since the text has already been processed
export function validateProcessedCVText(text: string): { isValid: boolean; error?: string; pattern?: string } {
  // Check if text exists
  if (text === undefined || text === null) {
    return { isValid: false, error: 'Text is required' };
  }

  // Check text length (allow longer text for processed CVs)
  const maxLength = MAX_TEXT_LENGTH * 2; // Double the limit for processed CVs
  if (text.length > maxLength) {
    return { isValid: false, error: `Text exceeds maximum length of ${maxLength} characters` };
  }

  // Only check for the most dangerous XSS patterns
  const xssPatterns = [
    { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, name: 'script tag' },
    { pattern: /javascript:/gi, name: 'javascript protocol' },
  ];

  for (const { pattern, name } of xssPatterns) {
    if (pattern.test(text)) {
      return { isValid: false, error: `Text contains potentially malicious content (${name})`, pattern: name };
    }
  }

  // Skip all SQL validation for processed CV text
  return { isValid: true };
}

// Job name validation function with enhanced security
export function validateJobName(jobName: string): { isValid: boolean; error?: string } {
  // Basic validation
  const basicValidation = validateText(jobName, MAX_JOB_NAME_LENGTH);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // Additional validation for job name - should not contain special characters that could be used for injection
  const specialCharsPattern = /[<>{}[\]()'"\\]/;
  if (specialCharsPattern.test(jobName)) {
    return { isValid: false, error: 'Job name contains invalid characters' };
  }

  return { isValid: true };
}

// Job description validation function with enhanced security
export function validateJobDescription(jobDescription: string): { isValid: boolean; error?: string } {
  return validateText(jobDescription, MAX_JOB_DESCRIPTION_LENGTH);
}

// Zod schema for comprehensive input validation
const CVFormSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= MAX_FILE_SIZE,
    `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
  ).refine(
    (file) => ALLOWED_FILE_TYPES.includes(file.type),
    'Invalid file type. Please upload a PDF, Word document, or text file.'
  ),
  jobName: z.string().max(MAX_JOB_NAME_LENGTH).optional().refine(
    (name) => !name || !/[<>{}[\]()'"\\]/.test(name),
    'Job name contains invalid characters'
  ),
  jobDescription: z.string().max(MAX_JOB_DESCRIPTION_LENGTH).optional()
});

// Comprehensive input validation for the main form with Zod
export function validateCVFormInputs(
  file: File,
  jobName: string,
  jobDescription: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Validate using Zod schema
    CVFormSchema.parse({
      file,
      jobName: jobName || '',
      jobDescription: jobDescription || ''
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(err => err.message));
    } else {
      errors.push('Validation failed');
    }
  }
  
  // Additional manual validations
  const fileValidation = validateFile(file);
  if (!fileValidation.isValid && fileValidation.error) {
    errors.push(fileValidation.error);
  }
  
  if (jobName) {
    const jobNameValidation = validateJobName(jobName);
    if (!jobNameValidation.isValid && jobNameValidation.error) {
      errors.push(jobNameValidation.error);
    }
  }
  
  if (jobDescription) {
    const jobDescriptionValidation = validateJobDescription(jobDescription);
    if (!jobDescriptionValidation.isValid && jobDescriptionValidation.error) {
      errors.push(jobDescriptionValidation.error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Rate limiting utility (simple in-memory implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function isRateLimited(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const windowResetTime = now + windowMs;
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, { count: 1, resetTime: windowResetTime });
    return false;
  }
  
  const record = rateLimitStore.get(identifier)!;
  
  // Reset if window has passed
  if (now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: windowResetTime });
    return false;
  }
  
  // Increment count
  record.count++;
  
  // Check if limit exceeded
  if (record.count > maxRequests) {
    return true;
  }
  
  return false;
}

// Clear old rate limit records (to prevent memory leaks)
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Periodically clean up rate limit store
setInterval(cleanupRateLimitStore, 60000); // Every minute