#!/usr/bin/env node
/**
 * Entry point for MCP Test Kits server (TypeScript)
 */

import { parseArgs } from "node:util";
import { Config } from "./config.js";
import { createServer } from "./server.js";
import {
  runStdioServer,
  runHttpServer,
  runSseServer,
} from "./transports/index.js";

function printHelp(): void {
  console.log(`
MCP Test Kits - A comprehensive MCP testing server

Usage:
  mcp-test-kits [options]

Options:
  -t, --transport <type>  Transport type: stdio, http, sse (default: stdio)
      --host <host>       Host to bind to (default: localhost)
  -p, --port <port>       Port to listen on (default: 3000)
  -l, --log-level <level> Log level: debug, info, warn, error (default: info)
      --no-tools          Disable tools capability
      --no-resources      Disable resources capability
      --no-prompts        Disable prompts capability
  -v, --version           Show version
  -h, --help              Show this help

Examples:
  # Run with stdio (default)
  mcp-test-kits

  # Run with HTTP transport
  mcp-test-kits --transport http --port 3000

  # Run with only tools (no resources or prompts)
  mcp-test-kits --no-resources --no-prompts
`);
}

async function main(): Promise<void> {
  // Parse command line arguments
  const { values } = parseArgs({
    options: {
      transport: { type: "string", short: "t", default: "stdio" },
      host: { type: "string", default: "localhost" },
      port: { type: "string", short: "p", default: "3000" },
      "log-level": { type: "string", short: "l", default: "info" },
      "no-tools": { type: "boolean", default: false },
      "no-resources": { type: "boolean", default: false },
      "no-prompts": { type: "boolean", default: false },
      version: { type: "boolean", short: "v" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
  });

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  if (values.version) {
    console.log("mcp-test-kits 1.0.0");
    process.exit(0);
  }

  // Build config from CLI args
  const transport = values.transport as "stdio" | "http" | "sse";
  const host = values.host as string;
  const port = parseInt(values.port as string, 10);

  const config = new Config({
    server: { name: "mcp-test-kits", version: "1.0.0" },
    transport: { type: transport, network: { host, port } },
    capabilities: {
      tools: !values["no-tools"],
      resources: !values["no-resources"],
      prompts: !values["no-prompts"],
    },
  });

  // Create server
  const server = createServer(config);

  // Run with appropriate transport
  switch (transport) {
    case "stdio":
      await runStdioServer(server, config);
      break;
    case "http":
      await runHttpServer(server, config);
      break;
    case "sse":
      await runSseServer(server, config);
      break;
    default:
      console.error(`Unknown transport type: ${transport}`);
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
