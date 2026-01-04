/**
 * OAuth configuration types
 */

export interface OAuthConfig {
  /** Enable OAuth authentication for HTTP/SSE transports */
  enabled: boolean;

  /** Auto-approve consent for testing (skips consent screen) */
  autoApprove: boolean;

  /** OAuth issuer URL. Defaults to server URL if not specified */
  issuer: string | null;

  /** Access token TTL in seconds (1 minute to 24 hours) */
  tokenExpiration: number;

  /** Authorization code TTL in seconds (1 minute to 30 minutes) */
  authorizationCodeTtl: number;
}

export const defaultOAuthConfig: OAuthConfig = {
  enabled: false,
  autoApprove: false,
  issuer: null,
  tokenExpiration: 3600, // 1 hour
  authorizationCodeTtl: 600, // 10 minutes
};
