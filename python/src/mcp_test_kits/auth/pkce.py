"""PKCE (Proof Key for Code Exchange) verification."""

from __future__ import annotations

import base64
import hashlib


def verify_code_challenge(verifier: str, challenge: str) -> bool:
    """Verify PKCE S256 code challenge.

    Args:
        verifier: Code verifier provided during token exchange.
        challenge: Code challenge from authorization request.

    Returns:
        True if challenge matches verifier, False otherwise.
    """
    # Compute SHA256 hash of verifier
    digest = hashlib.sha256(verifier.encode("ascii")).digest()

    # Base64 URL-encode without padding
    computed_challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")

    return computed_challenge == challenge
