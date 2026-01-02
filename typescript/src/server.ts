/**
 * MCP Server setup for MCP Test Kits
 */

import { Config } from "./config.js";
import { IntrospectableMcpServer } from "./introspection.js";
import { registerTools } from "./capabilities/tools.js";
import { registerResources } from "./capabilities/resources.js";
import { registerPrompts } from "./capabilities/prompts.js";

/**
 * Create and configure the MCP server
 */
export function createServer(config: Config): IntrospectableMcpServer {
  const server = new IntrospectableMcpServer({
    name: config.server.name,
    version: config.server.version,
  });

  // Register capabilities based on config
  if (config.capabilities.tools) {
    registerTools(server);
  }

  if (config.capabilities.resources) {
    registerResources(server);
  }

  if (config.capabilities.prompts) {
    registerPrompts(server);
  }

  return server;
}
