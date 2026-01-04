/**
 * OAuth authorization endpoints (/oauth/authorize, /oauth/token, /oauth/revoke)
 */

import type { Request, Response, Express } from "express";
import type { Config } from "../config.js";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { createAccessToken } from "./jwtHandler.js";
import { verifyCodeChallenge } from "./pkce.js";
import {
  storeAuthorizationCode,
  getAuthorizationCode,
  deleteAuthorizationCode,
  storeAccessToken,
  revokeToken,
  registerClient,
} from "./tokenStore.js";

/**
 * Handle GET /oauth/authorize - Show consent or auto-approve
 */
export function authorizeGet(
  req: Request,
  res: Response,
  config: Config,
): void {
  const params = req.query as Record<string, string>;

  // Validate parameters
  const errors = validateAuthorizeParams(params);
  if (errors.length > 0) {
    return errorRedirect(res, params.redirect_uri, errors[0], params.state);
  }

  // Auto-approve mode (for testing)
  if (config.oauth.autoApprove) {
    const code = randomBytes(32).toString("base64url");
    storeAuthorizationCode(
      code,
      params.client_id,
      params.redirect_uri,
      params.scope,
      params.code_challenge,
      params.code_challenge_method,
      params.resource,
      params.state || null,
      config.oauth.authorizationCodeTtl,
    );
    return successRedirect(res, params.redirect_uri, code, params.state);
  }

  // Show consent form
  renderConsentForm(res, params);
}

/**
 * Handle POST /oauth/authorize - Process consent form submission
 */
export function authorizePost(
  req: Request,
  res: Response,
  config: Config,
): void {
  const params = req.body as Record<string, string>;
  const action = params.action;

  // User denied
  if (action === "deny") {
    return errorRedirect(
      res,
      params.redirect_uri,
      "access_denied",
      params.state,
      "User denied consent",
    );
  }

  // User approved
  if (action === "approve") {
    const code = randomBytes(32).toString("base64url");
    storeAuthorizationCode(
      code,
      params.client_id,
      params.redirect_uri,
      params.scope,
      params.code_challenge,
      params.code_challenge_method,
      params.resource,
      params.state || null,
      config.oauth.authorizationCodeTtl,
    );
    return successRedirect(res, params.redirect_uri, code, params.state);
  }

  res.status(400).send("Invalid action");
}

/**
 * Handle POST /oauth/token - Exchange authorization code for access token
 */
export function tokenPost(req: Request, res: Response, config: Config): void {
  const params = req.body as Record<string, string>;

  // Validate grant_type
  if (params.grant_type !== "authorization_code") {
    return tokenError(res, "unsupported_grant_type");
  }

  // Get authorization code
  const code = params.code;
  if (!code) {
    return tokenError(res, "invalid_request", "Missing code parameter");
  }

  const authData = getAuthorizationCode(code);
  if (!authData) {
    return tokenError(
      res,
      "invalid_grant",
      "Invalid or expired authorization code",
    );
  }

  // Validate client_id
  if (params.client_id !== authData.clientId) {
    return tokenError(res, "invalid_client");
  }

  // Validate redirect_uri
  if (params.redirect_uri !== authData.redirectUri) {
    return tokenError(res, "invalid_grant", "Redirect URI mismatch");
  }

  // Validate PKCE verifier
  const codeVerifier = params.code_verifier;
  if (!codeVerifier) {
    return tokenError(res, "invalid_request", "Missing code_verifier");
  }

  if (!verifyCodeChallenge(codeVerifier, authData.codeChallenge)) {
    return tokenError(res, "invalid_grant", "Invalid code_verifier");
  }

  // Delete authorization code (one-time use)
  deleteAuthorizationCode(code);

  // Get issuer
  const issuer = config.oauth.issuer || buildIssuer(config, req);

  // Create access token
  const accessToken = createAccessToken(
    "test-user",
    authData.scope,
    authData.resource,
    issuer,
    config.oauth.tokenExpiration,
  );

  // Store token metadata (for revocation)
  const decoded = jwt.decode(accessToken) as { jti: string; sub: string };
  storeAccessToken(
    decoded.jti,
    decoded.sub,
    authData.scope,
    authData.resource,
    config.oauth.tokenExpiration,
  );

  res.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: config.oauth.tokenExpiration,
    scope: authData.scope,
  });
}

/**
 * Handle POST /oauth/revoke - Revoke access token
 */
export function revokePost(req: Request, res: Response): void {
  const token = req.body.token;

  if (token) {
    try {
      // Extract jti from token
      const decoded = jwt.decode(token) as { jti?: string } | null;
      if (decoded?.jti) {
        revokeToken(decoded.jti);
      }
    } catch {
      // Ignore errors per RFC 7009
    }
  }

  // Always return 200 OK (per RFC 7009)
  res.status(200).send();
}

/**
 * Handle POST /oauth/register - Dynamic Client Registration (RFC 7591)
 */
export function registerPost(req: Request, res: Response): void {
  const body = req.body;

  // Validate required fields
  const clientName = body.client_name;
  const redirectUris = body.redirect_uris;

  if (!clientName || typeof clientName !== "string") {
    return registrationError(
      res,
      "invalid_request",
      "Missing or invalid client_name",
    );
  }

  if (!Array.isArray(redirectUris) || redirectUris.length === 0) {
    return registrationError(
      res,
      "invalid_request",
      "Missing or invalid redirect_uris",
    );
  }

  // Validate redirect URIs
  for (const uri of redirectUris) {
    if (
      typeof uri !== "string" ||
      (!uri.startsWith("http://") && !uri.startsWith("https://"))
    ) {
      return registrationError(
        res,
        "invalid_redirect_uri",
        `Invalid redirect URI: ${uri}`,
      );
    }
  }

  // Extract optional fields with defaults
  const grantTypes = body.grant_types || ["authorization_code"];
  const responseTypes = body.response_types || ["code"];
  const tokenEndpointAuthMethod = body.token_endpoint_auth_method || "none";

  // Validate grant_types and response_types
  if (
    !Array.isArray(grantTypes) ||
    !grantTypes.includes("authorization_code")
  ) {
    return registrationError(
      res,
      "invalid_request",
      "Only authorization_code grant type supported",
    );
  }

  if (!Array.isArray(responseTypes) || !responseTypes.includes("code")) {
    return registrationError(
      res,
      "invalid_request",
      "Only code response type supported",
    );
  }

  // Generate unique client_id
  const clientId = randomBytes(16).toString("hex");

  // Register client
  const clientData = registerClient(
    clientId,
    clientName,
    redirectUris,
    grantTypes,
    responseTypes,
    tokenEndpointAuthMethod,
  );

  // Return client registration response
  res.status(201).json({
    client_id: clientData.clientId,
    client_name: clientData.clientName,
    redirect_uris: clientData.redirectUris,
    grant_types: clientData.grantTypes,
    response_types: clientData.responseTypes,
    token_endpoint_auth_method: clientData.tokenEndpointAuthMethod,
    client_id_issued_at: clientData.clientIdIssuedAt,
  });
}

/**
 * Validate authorization request parameters
 */
function validateAuthorizeParams(params: Record<string, string>): string[] {
  const errors: string[] = [];

  const required = [
    "client_id",
    "redirect_uri",
    "response_type",
    "scope",
    "code_challenge",
    "code_challenge_method",
    "resource",
  ];

  for (const param of required) {
    if (!params[param]) {
      errors.push(`invalid_request: Missing ${param}`);
    }
  }

  if (params.response_type !== "code") {
    errors.push("unsupported_response_type");
  }

  if (params.code_challenge_method !== "S256") {
    errors.push("invalid_request: Only S256 code_challenge_method supported");
  }

  return errors;
}

/**
 * Redirect with authorization code
 */
function successRedirect(
  res: Response,
  redirectUri: string,
  code: string,
  state: string | undefined,
): void {
  const params = new URLSearchParams({ code });
  if (state) {
    params.set("state", state);
  }
  res.redirect(`${redirectUri}?${params.toString()}`);
}

/**
 * Redirect with OAuth error
 */
function errorRedirect(
  res: Response,
  redirectUri: string | undefined,
  error: string,
  state: string | undefined,
  errorDescription?: string,
): void {
  if (!redirectUri) {
    res.status(400).send(`Error: ${error}`);
    return;
  }

  const params = new URLSearchParams({ error });
  if (errorDescription) {
    params.set("error_description", errorDescription);
  }
  if (state) {
    params.set("state", state);
  }

  res.redirect(`${redirectUri}?${params.toString()}`);
}

/**
 * Return OAuth token error response
 */
function tokenError(
  res: Response,
  error: string,
  errorDescription?: string,
): void {
  const responseData: { error: string; error_description?: string } = { error };
  if (errorDescription) {
    responseData.error_description = errorDescription;
  }
  res.status(400).json(responseData);
}

/**
 * Return OAuth client registration error response
 */
function registrationError(
  res: Response,
  error: string,
  errorDescription?: string,
): void {
  const responseData: { error: string; error_description?: string } = { error };
  if (errorDescription) {
    responseData.error_description = errorDescription;
  }
  res.status(400).json(responseData);
}

/**
 * Render consent form HTML
 */
function renderConsentForm(
  res: Response,
  params: Record<string, string>,
): void {
  const scopesHtml = params.scope
    .split(" ")
    .map((s) => `• ${s}`)
    .join("<br>");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>OAuth Authorization</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
    .scopes { margin: 20px 0; }
    button { margin: 10px 10px 10px 0; padding: 10px 20px; font-size: 16px; cursor: pointer; }
    .approve { background: #28a745; color: white; border: none; }
    .deny { background: #dc3545; color: white; border: none; }
  </style>
</head>
<body>
  <h1>Authorization Request</h1>
  <p><strong>Client:</strong> ${params.client_id}</p>
  <p><strong>Redirect URI:</strong> ${params.redirect_uri}</p>
  <p><strong>Resource:</strong> ${params.resource}</p>

  <div class="scopes">
    <strong>Requested Scopes:</strong><br>
    ${scopesHtml}
  </div>

  <form method="POST" action="/oauth/authorize">
    <input type="hidden" name="client_id" value="${params.client_id}">
    <input type="hidden" name="redirect_uri" value="${params.redirect_uri}">
    <input type="hidden" name="scope" value="${params.scope}">
    <input type="hidden" name="state" value="${params.state || ""}">
    <input type="hidden" name="code_challenge" value="${params.code_challenge}">
    <input type="hidden" name="code_challenge_method" value="${params.code_challenge_method}">
    <input type="hidden" name="resource" value="${params.resource}">

    <button type="submit" name="action" value="approve" class="approve">Approve</button>
    <button type="submit" name="action" value="deny" class="deny">Deny</button>
  </form>
</body>
</html>
`;

  res.send(html);
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

/**
 * Register OAuth endpoint routes
 */
export function registerOAuthRoutes(app: Express, config: Config): void {
  // Need to parse URL-encoded form data for token endpoint
  app.use("/oauth", express.urlencoded({ extended: true }));

  app.get("/oauth/authorize", (req, res) => authorizeGet(req, res, config));
  app.post("/oauth/authorize", (req, res) => authorizePost(req, res, config));
  app.post("/oauth/token", (req, res) => tokenPost(req, res, config));
  app.post("/oauth/revoke", (req, res) => revokePost(req, res));
  app.post("/oauth/register", (req, res) => registerPost(req, res));
}

// Need to import express for the middleware
import express from "express";
