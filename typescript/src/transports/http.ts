/**
 * HTTP transport for MCP Test Kits (Streamable HTTP)
 */

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Config } from "../config.js";
import { oauthMiddleware } from "../auth/middleware.js";
import { registerWellKnownRoutes } from "../auth/wellKnown.js";
import { registerOAuthRoutes } from "../auth/oauthEndpoints.js";

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

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.error(
        `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`,
      );
    });
    next();
  });

  if (config.oauth.enabled) {
    console.error(
      `OAuth enabled - authorize at http://${host}:${port}/oauth/authorize`,
    );

    // Register OAuth routes (must be before middleware)
    registerWellKnownRoutes(app, config);
    registerOAuthRoutes(app, config);

    // Add OAuth middleware (protects /mcp)
    app.use(oauthMiddleware(config));
  }

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
  const httpServer = app.listen(port, host, () => {
    console.error(`MCP HTTP server listening on http://${host}:${port}`);
  });

  // Graceful shutdown on SIGINT/SIGTERM
  const shutdown = () => {
    console.error("\nShutting down gracefully...");
    httpServer.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Keep the process running
  await new Promise(() => {});
}
