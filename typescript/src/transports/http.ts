/**
 * HTTP transport for MCP Test Kits (Streamable HTTP)
 */

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Config } from "../config.js";

/**
 * Run the MCP server over HTTP transport (Streamable HTTP)
 */
export async function runHttpServer(
  server: McpServer,
  config: Config,
): Promise<void> {
  const { host, port } = config.transport.network;

  const app = express();
  app.use(express.json());

  // MCP endpoint - handle all HTTP methods
  app.all("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  // Start server
  console.error(`Starting MCP HTTP server at http://${host}:${port}/mcp`);
  app.listen(port, host, () => {
    console.error(`MCP HTTP server listening on http://${host}:${port}`);
  });

  // Keep the process running
  await new Promise(() => {});
}
