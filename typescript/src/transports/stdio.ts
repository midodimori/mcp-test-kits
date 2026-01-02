/**
 * Stdio transport for MCP Test Kits
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Config } from "../config.js";

/**
 * Run the MCP server over stdio transport
 */
export async function runStdioServer(
  server: McpServer,
  _config: Config,
): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Keep the process running
  await new Promise(() => {});
}
