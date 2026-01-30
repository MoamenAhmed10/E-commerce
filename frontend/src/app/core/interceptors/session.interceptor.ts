import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

const SESSION_ID_KEY = 'session_id';

/**
 * Generate a simple unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Session Interceptor
 * Attaches x-session-id header to all API requests for guest cart tracking
 * - Generates a unique session ID if one doesn't exist
 * - Persists session ID in localStorage
 * - Ensures guest cart items are tracked across page reloads
 */
export const sessionInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  // Get or create session ID
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  // Clone request and add session ID header
  const clonedReq = req.clone({
    setHeaders: {
      'x-session-id': sessionId,
    },
  });

  return next(clonedReq);
};

/**
 * Clear session ID (called when needed)
 */
export function clearSessionId(): void {
  localStorage.removeItem(SESSION_ID_KEY);
}

/**
 * Get current session ID
 */
export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_ID_KEY);
}
