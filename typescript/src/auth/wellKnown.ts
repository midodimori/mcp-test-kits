/**
 * Well-known OAuth discovery endpoints
 */

import type { Request, Response, Express } from "express";
import type { Config } from "../config.js";
import { getAllSupportedScopes } from "./scopes.js";

/**
 * OAuth Protected Resource Metadata endpoint (RFC 9728)
 */
export function protectedResourceMetadata(
  req: Request,
  res: Response,
  config: Config,
): void {
  const issuer = getIssuer(config, req);

  res.json({
    resource: issuer,
    authorization_servers: [issuer],
    bearer_methods_supported: ["header"],
    resource_documentation: `${issuer}/docs`,
    scopes_supported: getAllSupportedScopes(),
  });
}

/**
 * OAuth Authorization Server Metadata endpoint (RFC 8414)
 */
export function authorizationServerMetadata(
  req: Request,
  res: Response,
  config: Config,
): void {
  const issuer = getIssuer(config, req);

  res.json({
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    revocation_endpoint: `${issuer}/oauth/revoke`,
    registration_endpoint: `${issuer}/oauth/register`,
    code_challenge_methods_supported: ["S256"],
    grant_types_supported: ["authorization_code"],
    response_types_supported: ["code"],
    token_endpoint_auth_methods_supported: ["none"],
    client_id_metadata_document_supported: true,
    scopes_supported: getAllSupportedScopes(),
  });
}

/**
 * Get OAuth issuer URL
 */
function getIssuer(config: Config, req: Request): string {
  if (config.oauth.issuer) {
    return config.oauth.issuer;
  }

  // Build issuer from request
  let { host } = config.transport.network;
  const { port } = config.transport.network;
  const scheme = req.protocol;

  // Use localhost if host is 0.0.0.0
  if (host === "0.0.0.0" || host === "") {
    host = "localhost";
  }

  if (
    (scheme === "http" && port === 80) ||
    (scheme === "https" && port === 443)
  ) {
    return `${scheme}://${host}`;
  }
  return `${scheme}://${host}:${port}`;
}

/**
 * Register well-known OAuth discovery routes
 */
export function registerWellKnownRoutes(app: Express, config: Config): void {
  app.get("/.well-known/oauth-protected-resource", (req, res) => {
    protectedResourceMetadata(req, res, config);
  });

  app.get("/.well-known/oauth-authorization-server", (req, res) => {
    authorizationServerMetadata(req, res, config);
  });
}
