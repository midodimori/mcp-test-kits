/**
 * In-memory token and authorization code storage
 */

export interface AuthCodeData {
  clientId: string;
  redirectUri: string;
  scope: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  resource: string;
  state: string | null;
  createdAt: number;
}

export interface TokenData {
  jti: string;
  subject: string;
  scopes: string;
  resource: string;
  createdAt: number;
  expiresAt: number;
}

export interface ClientData {
  clientId: string;
  clientName: string;
  redirectUris: string[];
  grantTypes: string[];
  responseTypes: string[];
  tokenEndpointAuthMethod: string;
  clientIdIssuedAt: number;
}

// In-memory storage
const authorizationCodes = new Map<string, AuthCodeData>();
const accessTokens = new Map<string, TokenData>();
const revokedTokens = new Set<string>();
const registeredClients = new Map<string, ClientData>();

/**
 * Store an authorization code
 * @param ttl - Time to live in seconds (reserved for future use)
 */
export function storeAuthorizationCode(
  code: string,
  clientId: string,
  redirectUri: string,
  scope: string,
  codeChallenge: string,
  codeChallengeMethod: string,
  resource: string,
  state: string | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ttl: number,
): void {
  authorizationCodes.set(code, {
    clientId,
    redirectUri,
    scope,
    codeChallenge,
    codeChallengeMethod,
    resource,
    state,
    createdAt: Date.now(),
  });
  // Clean up expired codes
  cleanupExpiredCodes();
}

/**
 * Retrieve authorization code data
 */
export function getAuthorizationCode(code: string): AuthCodeData | null {
  return authorizationCodes.get(code) || null;
}

/**
 * Delete an authorization code (one-time use)
 */
export function deleteAuthorizationCode(code: string): void {
  authorizationCodes.delete(code);
}

/**
 * Store access token metadata
 */
export function storeAccessToken(
  jti: string,
  subject: string,
  scopes: string,
  resource: string,
  expiresIn: number,
): void {
  const now = Date.now();
  accessTokens.set(jti, {
    jti,
    subject,
    scopes,
    resource,
    createdAt: now,
    expiresAt: now + expiresIn * 1000,
  });
  // Clean up expired tokens
  cleanupExpiredTokens();
}

/**
 * Revoke an access token
 */
export function revokeToken(tokenJti: string): void {
  revokedTokens.add(tokenJti);
}

/**
 * Check if a token is revoked
 */
export function isTokenRevoked(tokenJti: string): boolean {
  return revokedTokens.has(tokenJti);
}

/**
 * Remove expired authorization codes
 */
function cleanupExpiredCodes(): void {
  const now = Date.now();
  for (const [code, data] of authorizationCodes.entries()) {
    if (now - data.createdAt > 600000) {
      // 10 minutes
      authorizationCodes.delete(code);
    }
  }
}

/**
 * Remove expired access tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [jti, data] of accessTokens.entries()) {
    if (now > data.expiresAt) {
      accessTokens.delete(jti);
      revokedTokens.delete(jti);
    }
  }
}

/**
 * Register a new OAuth client
 */
export function registerClient(
  clientId: string,
  clientName: string,
  redirectUris: string[],
  grantTypes: string[],
  responseTypes: string[],
  tokenEndpointAuthMethod: string,
): ClientData {
  const clientData: ClientData = {
    clientId,
    clientName,
    redirectUris,
    grantTypes,
    responseTypes,
    tokenEndpointAuthMethod,
    clientIdIssuedAt: Math.floor(Date.now() / 1000),
  };
  registeredClients.set(clientId, clientData);
  return clientData;
}

/**
 * Retrieve registered client data
 */
export function getClient(clientId: string): ClientData | null {
  return registeredClients.get(clientId) || null;
}
