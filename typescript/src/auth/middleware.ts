/**
 * OAuth authentication middleware for Express
 */

import type { Request, Response, NextFunction } from "express";
import type { Config } from "../config.js";
import { validateToken, type TokenPayload } from "./jwtHandler.js";
import { isTokenRevoked } from "./tokenStore.js";

// Extend Express Request type to include oauth property
declare module "express-serve-static-core" {
  interface Request {
    oauth?: {
      token: TokenPayload;
    };
  }
}

/**
 * OAuth authentication middleware
 *
 * Validates Bearer tokens on all requests except OAuth endpoints
 */
export function oauthMiddleware(config: Config) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip OAuth-related endpoints
    if (req.path.startsWith("/.well-known") || req.path.startsWith("/oauth")) {
      return next();
    }

    // Get issuer
    const issuer = config.oauth.issuer || buildIssuer(config, req);

    // Extract Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorizedResponse(res, issuer);
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Validate token
    let payload: TokenPayload;
    try {
      payload = validateToken(token, issuer);
    } catch {
      return unauthorizedResponse(res, issuer, "Invalid token");
    }

    // Check if token is revoked
    const jti = payload.jti;
    if (jti && isTokenRevoked(jti)) {
      return unauthorizedResponse(res, issuer, "Token revoked");
    }

    // Attach token payload to request
    req.oauth = { token: payload };

    next();
  };
}

/**
 * Return 401 Unauthorized response with WWW-Authenticate header
 */
function unauthorizedResponse(
  res: Response,
  issuer: string,
  error?: string,
): void {
  let wwwAuthenticate =
    `Bearer realm="${issuer}", ` +
    `resource_metadata="${issuer}/.well-known/oauth-protected-resource"`;

  if (error) {
    wwwAuthenticate += `, error="invalid_token", error_description="${error}"`;
  }

  res.status(401).set("WWW-Authenticate", wwwAuthenticate).json({
    error: "unauthorized",
    message: "Valid Bearer token required",
  });
}

/**
 * Build issuer URL from config and request
 */
function buildIssuer(config: Config, req: Request): string {
  let { host } = config.transport.network;
  const { port } = config.transport.network;
  const scheme = req.protocol;

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
