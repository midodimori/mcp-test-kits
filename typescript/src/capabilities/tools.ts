/**
 * Tool implementations for MCP Test Kits
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer): void {
  // echo tool
  server.tool(
    "echo",
    "Returns the input message unchanged",
    { message: z.string().describe("The message to echo") },
    async ({ message }: { message: string }) => ({
      content: [{ type: "text", text: message }],
    }),
  );

  // add tool
  server.tool(
    "add",
    "Adds two numbers together",
    {
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    },
    async ({ a, b }: { a: number; b: number }) => ({
      content: [{ type: "text", text: String(a + b) }],
    }),
  );

  // multiply tool
  server.tool(
    "multiply",
    "Multiplies two numbers",
    {
      x: z.number().describe("First number"),
      y: z.number().describe("Second number"),
    },
    async ({ x, y }: { x: number; y: number }) => ({
      content: [{ type: "text", text: String(x * y) }],
    }),
  );

  // reverse_string tool
  server.tool(
    "reverse_string",
    "Reverses a string",
    { text: z.string().describe("Text to reverse") },
    async ({ text }: { text: string }) => ({
      content: [{ type: "text", text: text.split("").reverse().join("") }],
    }),
  );

  // generate_uuid tool
  server.tool("generate_uuid", "Generates a random UUID", {}, async () => ({
    content: [{ type: "text", text: crypto.randomUUID() }],
  }));

  // get_timestamp tool
  server.tool(
    "get_timestamp",
    "Returns the current timestamp",
    {
      format: z
        .enum(["unix", "iso"])
        .default("iso")
        .describe("Format: 'unix' or 'iso'"),
    },
    async ({ format }: { format: string }) => {
      const now = new Date();
      const result =
        format === "unix"
          ? String(Math.floor(now.getTime() / 1000))
          : now.toISOString();
      return { content: [{ type: "text", text: result }] };
    },
  );

  // sample_error tool
  server.tool(
    "sample_error",
    "Always throws an error (for testing error handling)",
    {
      error_message: z
        .string()
        .default("This is a test error")
        .describe("Custom error message"),
    },
    async ({ error_message }: { error_message: string }) => {
      throw new Error(error_message);
    },
  );

  // long_running_task tool
  server.tool(
    "long_running_task",
    "Simulates a long-running operation",
    {
      duration: z
        .number()
        .min(0)
        .max(10)
        .describe("Duration in seconds (max 10)"),
    },
    async ({ duration }: { duration: number }) => {
      const actualDuration = Math.min(Math.max(duration, 0), 10);
      await new Promise((resolve) =>
        setTimeout(resolve, actualDuration * 1000),
      );
      return {
        content: [
          {
            type: "text",
            text: `Task completed after ${actualDuration} seconds`,
          },
        ],
      };
    },
  );
}
