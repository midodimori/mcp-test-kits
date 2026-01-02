/**
 * Resource implementations for MCP Test Kits
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Large text content for testing
const LARGE_TEXT_CONTENT = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum.

`.repeat(100);

/**
 * Register all resources with the MCP server
 */
export function registerResources(server: McpServer): void {
  // Static greeting resource
  server.registerResource(
    "static-greeting",
    "test://static/greeting",
    { title: "Static Greeting", mimeType: "text/plain" },
    async () => ({
      contents: [
        {
          uri: "test://static/greeting",
          mimeType: "text/plain",
          text: "Hello from mcp-test-kits!",
        },
      ],
    }),
  );

  // Static numbers resource
  server.registerResource(
    "static-numbers",
    "test://static/numbers",
    { title: "Number List", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "test://static/numbers",
          mimeType: "application/json",
          text: JSON.stringify({ numbers: [1, 2, 3, 4, 5] }),
        },
      ],
    }),
  );

  // Dynamic timestamp resource
  server.registerResource(
    "dynamic-timestamp",
    "test://dynamic/timestamp",
    { title: "Current Timestamp", mimeType: "application/json" },
    async () => {
      const now = new Date();
      return {
        contents: [
          {
            uri: "test://dynamic/timestamp",
            mimeType: "application/json",
            text: JSON.stringify({
              timestamp: now.toISOString(),
              unix: Math.floor(now.getTime() / 1000),
            }),
          },
        ],
      };
    },
  );

  // Dynamic random resource
  server.registerResource(
    "dynamic-random",
    "test://dynamic/random",
    { title: "Random Number", mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "test://dynamic/random",
          mimeType: "application/json",
          text: JSON.stringify({ random: Math.floor(Math.random() * 101) }),
        },
      ],
    }),
  );

  // Large text resource
  server.registerResource(
    "large-text",
    "test://large-text",
    { title: "Large Text Resource", mimeType: "text/plain" },
    async () => ({
      contents: [
        {
          uri: "test://large-text",
          mimeType: "text/plain",
          text: LARGE_TEXT_CONTENT,
        },
      ],
    }),
  );
}
