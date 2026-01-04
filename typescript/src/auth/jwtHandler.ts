/**
 * JWT token creation and validation
 */

import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

// Test secret key - DO NOT use in production
const SECRET_KEY = "mcp-test-kits-secret-do-not-use-in-production";
const ALGORITHM = "HS256";

export interface TokenPayload {
  iss: string;
  aud: string;
  sub: string;
  scope: string;
  resource: string;
  iat: number;
  exp: number;
  jti: string;
}

/**
 * Create a JWT access token
 *
 * @param subject - Subject identifier (user ID)
 * @param scopes - Space-separated scopes
 * @param resource - Target resource URI
 * @param issuer - OAuth issuer URL
 * @param expiration - Token TTL in seconds
 * @returns JWT access token string
 */
export function createAccessToken(
  subject: string,
  scopes: string,
  resource: string,
  issuer: string,
  expiration: number = 3600,
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    iss: issuer,
    aud: resource,
    sub: subject,
    scope: scopes,
    resource: resource,
    iat: now,
    exp: now + expiration,
    jti: randomUUID(),
  };

  return jwt.sign(payload, SECRET_KEY, { algorithm: ALGORITHM });
}

/**
 * Validate a JWT access token
 *
 * @param token - JWT token string
 * @param issuer - Expected issuer URL
 * @returns Decoded token payload
 * @throws Error if token is invalid, expired, or issuer doesn't match
 */
export function validateToken(token: string, issuer: string): TokenPayload {
  // Resource URL may have trailing slash, accept both formats per RFC 8707
  const issuerNoSlash = issuer.replace(/\/$/, "");
  const validAudiences: [string, ...string[]] = [
    issuer,
    issuerNoSlash + "/", // With trailing slash
    issuerNoSlash, // Without trailing slash
  ];

  const payload = jwt.verify(token, SECRET_KEY, {
    algorithms: [ALGORITHM],
    audience: validAudiences,
  });

  // Verify issuer
  const decoded = payload as TokenPayload;
  if (decoded.iss !== issuer) {
    throw new Error("Invalid issuer");
  }

  return decoded;
}
