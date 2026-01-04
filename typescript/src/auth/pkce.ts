/**
 * PKCE (Proof Key for Code Exchange) verification
 */

import { createHash } from "crypto";

/**
 * Verify PKCE S256 code challenge
 *
 * @param verifier - Code verifier provided during token exchange
 * @param challenge - Code challenge from authorization request
 * @returns True if challenge matches verifier, false otherwise
 */
export function verifyCodeChallenge(
  verifier: string,
  challenge: string,
): boolean {
  // Compute SHA256 hash of verifier
  const hash = createHash("sha256").update(verifier).digest();

  // Base64 URL-encode without padding
  const computedChallenge = hash
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return computedChallenge === challenge;
}
