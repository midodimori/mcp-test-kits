/**
 * SSE transport for MCP Test Kits
 */

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import type { Config } from "../config.js";

/**
 * Run the MCP server over SSE transport
 */
export async function runSseServer(
  server: McpServer,
  config: Config,
): Promise<void> {
  const { host, port } = config.transport.network;

  const app = express();
  app.use(express.json());

  // Store active transports for session management
  const transports = new Map<string, SSEServerTransport>();

  // SSE endpoint for server->client messages
  app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport("/sse", res);
    const sessionId = transport.sessionId;
    transports.set(sessionId, transport);

    // Cleanup on close
    transport.onclose = () => {
      transports.delete(sessionId);
    };

    await server.connect(transport);
  });

  // POST endpoint for client->server messages
  app.post("/sse", async (req, res) => {
    const sessionId = req.query.sessionId as string | undefined;

    if (!sessionId || !transports.has(sessionId)) {
      res.status(400).json({ error: "Invalid or missing session ID" });
      return;
    }

    const transport = transports.get(sessionId)!;
    await transport.handlePostMessage(req, res, req.body);
  });

  // Start server
  console.error(`Starting MCP SSE server at http://${host}:${port}/sse`);
  app.listen(port, host, () => {
    console.error(`MCP SSE server listening on http://${host}:${port}`);
  });

  // Keep the process running
  await new Promise(() => {});
}
