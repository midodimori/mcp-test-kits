/**
 * Introspection utilities for extracting specifications from MCP Server
 */

import {
  McpServer,
  RegisteredTool,
  RegisteredResource,
  RegisteredResourceTemplate,
  RegisteredPrompt,
} from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Type representing the internal structure of McpServer with private fields exposed
 */
interface McpServerInternal {
  _registeredTools: Record<string, RegisteredTool>;
  _registeredResources: Record<string, RegisteredResource>;
  _registeredResourceTemplates: Record<string, RegisteredResourceTemplate>;
  _registeredPrompts: Record<string, RegisteredPrompt>;
}

/**
 * Extended McpServer with introspection capabilities.
 * Provides access to registered tools, resources, and prompts for spec extraction.
 */
export class IntrospectableMcpServer extends McpServer {
  /**
   * Get all registered tools with their metadata
   */
  getRegisteredTools(): Record<string, RegisteredTool> {
    // Access the private _registeredTools field (it's an object, not a Map)
    return (this as unknown as McpServerInternal)._registeredTools;
  }

  /**
   * Get all registered resources with their metadata
   */
  getRegisteredResources(): Record<string, RegisteredResource> {
    // Access the private _registeredResources field (it's an object, not a Map)
    return (this as unknown as McpServerInternal)._registeredResources;
  }

  /**
   * Get all registered resource templates with their metadata
   */
  getRegisteredResourceTemplates(): Record<string, RegisteredResourceTemplate> {
    // Access the private _registeredResourceTemplates field (it's an object, not a Map)
    return (this as unknown as McpServerInternal)._registeredResourceTemplates;
  }

  /**
   * Get all registered prompts with their metadata
   */
  getRegisteredPrompts(): Record<string, RegisteredPrompt> {
    // Access the private _registeredPrompts field (it's an object, not a Map)
    return (this as unknown as McpServerInternal)._registeredPrompts;
  }
}

interface ToolSpec {
  name: string;
  description: string;
}

interface ResourceSpec {
  name: string;
  uri: string;
  description?: string;
  mimeType?: string;
}

interface PromptArgSpec {
  name: string;
  description?: string;
  required?: boolean;
}

interface PromptSpec {
  name: string;
  description: string;
  arguments?: PromptArgSpec[];
}

/**
 * Extract tool specifications from an introspectable server
 */
export function extractToolsSpec(server: IntrospectableMcpServer): ToolSpec[] {
  const tools: ToolSpec[] = [];
  const registeredTools = server.getRegisteredTools();

  for (const [name, tool] of Object.entries(registeredTools)) {
    if (tool.enabled) {
      tools.push({
        name,
        description: tool.description || "",
      });
    }
  }

  return tools.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Extract resource specifications from an introspectable server
 */
export function extractResourcesSpec(
  server: IntrospectableMcpServer,
): ResourceSpec[] {
  const resources: ResourceSpec[] = [];
  const registeredResources = server.getRegisteredResources();

  for (const [uri, resource] of Object.entries(registeredResources)) {
    if (resource.enabled) {
      resources.push({
        name: resource.name,
        uri,
        mimeType: resource.metadata?.mimeType || "text/plain",
      });
    }
  }

  // Note: Resource templates are not included in static spec extraction
  // as they represent dynamic URI patterns

  return resources.sort((a, b) => a.uri.localeCompare(b.uri));
}

/**
 * Type representing Zod schema internal structure
 */
interface ZodSchemaDef {
  typeName?: string;
  shape?: () => Record<string, ZodSchemaInternal>;
  innerType?: ZodSchemaInternal;
  description?: string;
}

interface ZodSchemaInternal {
  _def: ZodSchemaDef;
}

/**
 * Extract argument specifications from Zod schema
 */
function extractPromptArgs(argsSchema: ZodSchemaInternal): PromptArgSpec[] {
  if (!argsSchema || !argsSchema._def) {
    return [];
  }

  const args: PromptArgSpec[] = [];

  // Handle Zod object schema
  if (argsSchema._def.typeName === "ZodObject") {
    const shape = argsSchema._def.shape?.();

    if (shape) {
      for (const [argName, argSchema] of Object.entries(shape)) {
        // Check if the argument is optional
        const isOptional = argSchema._def.typeName === "ZodOptional";
        const innerSchema = isOptional ? argSchema._def.innerType : argSchema;

        // Extract description from the schema
        let description = "";
        if (innerSchema?._def.description) {
          description = innerSchema._def.description;
        }

        args.push({
          name: argName,
          description,
          required: !isOptional,
        });
      }
    }
  }

  return args;
}

/**
 * Extract prompt specifications from an introspectable server
 */
export function extractPromptsSpec(
  server: IntrospectableMcpServer,
): PromptSpec[] {
  const prompts: PromptSpec[] = [];
  const registeredPrompts = server.getRegisteredPrompts();

  for (const [name, prompt] of Object.entries(registeredPrompts)) {
    if (prompt.enabled) {
      const args = prompt.argsSchema
        ? extractPromptArgs(prompt.argsSchema as ZodSchemaInternal)
        : [];

      prompts.push({
        name,
        description: prompt.description || "",
        arguments: args,
      });
    }
  }

  return prompts.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Extract full specification from an introspectable server
 */
export function extractSpec(server: IntrospectableMcpServer) {
  return {
    tools: extractToolsSpec(server),
    resources: extractResourcesSpec(server),
    prompts: extractPromptsSpec(server),
  };
}
