/**
 * OAuth scope parsing and validation
 */

/**
 * Parse space-separated scope string into array
 */
export function parseScopes(scopeString: string): string[] {
  return scopeString ? scopeString.split(" ") : [];
}

/**
 * Check if token has required scope (exact or wildcard match)
 */
export function hasRequiredScope(
  tokenScopes: string[],
  requiredScope: string,
): boolean {
  // Exact match
  if (tokenScopes.includes(requiredScope)) {
    return true;
  }

  // Wildcard match (e.g., mcp:tools:* covers mcp:tools:echo)
  const scopeParts = requiredScope.split(":");
  for (const tokenScope of tokenScopes) {
    if (tokenScope.endsWith(":*")) {
      // Check if wildcard scope is a prefix
      const prefix = tokenScope.slice(0, -2); // Remove :*
      const requiredPrefix = scopeParts.slice(0, -1).join(":"); // Remove last part
      if (requiredPrefix === prefix) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get required scope for a specific tool
 */
export function getRequiredScopeForTool(toolName: string): string {
  return `mcp:tools:${toolName}`;
}

/**
 * Get required scope for a resource URI
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getRequiredScopeForResource(uri: string): string {
  // For simplicity, require mcp:resources:* for all resources
  return "mcp:resources:*";
}

/**
 * Get required scope for a specific prompt
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getRequiredScopeForPrompt(promptName: string): string {
  return "mcp:prompts:*";
}

/**
 * Get list of all supported scopes
 */
export function getAllSupportedScopes(): string[] {
  return [
    "mcp:tools:*",
    "mcp:tools:echo",
    "mcp:tools:add",
    "mcp:tools:multiply",
    "mcp:tools:reverse_string",
    "mcp:tools:generate_uuid",
    "mcp:tools:get_timestamp",
    "mcp:tools:sample_error",
    "mcp:tools:long_running_task",
    "mcp:resources:*",
    "mcp:prompts:*",
  ];
}
