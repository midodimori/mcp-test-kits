/**
 * Prompt implementations for MCP Test Kits
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Register all prompts with the MCP server
 */
export function registerPrompts(server: McpServer): void {
  // Simple prompt
  server.prompt(
    "simple_prompt",
    "A basic prompt with no arguments",
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "You are a helpful assistant. Please respond concisely and accurately.",
          },
        },
      ],
    }),
  );

  // Greeting prompt
  server.prompt(
    "greeting_prompt",
    "Generate a greeting message",
    {
      name: z.string().describe("Name of the person to greet"),
      style: z
        .string()
        .optional()
        .describe("Greeting style (formal, casual, friendly)"),
    },
    async ({ name, style }: { name: string; style?: string }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a ${style ?? "friendly"} greeting for ${name}.`,
          },
        },
      ],
    }),
  );

  // Template prompt
  server.prompt(
    "template_prompt",
    "A template with multiple arguments",
    {
      topic: z.string().describe("Main topic"),
      context: z.string().optional().describe("Additional context"),
      length: z
        .string()
        .optional()
        .describe("Desired length (short, medium, long)"),
    },
    async ({
      topic,
      context,
      length,
    }: {
      topic: string;
      context?: string;
      length?: string;
    }) => {
      let text = `Write a ${length ?? "medium"} explanation about ${topic}.`;
      if (context) {
        text += ` Context: ${context}`;
      }
      return {
        messages: [
          {
            role: "user",
            content: { type: "text", text },
          },
        ],
      };
    },
  );

  // Multi-message prompt
  server.prompt(
    "multi_message_prompt",
    "Prompt that returns multiple messages",
    {
      count: z.string().describe("Number of messages to generate"),
    },
    async ({ count }: { count: string }) => {
      const numMessages = Math.max(1, Math.min(parseInt(count, 10) || 1, 10));
      const messages = Array.from({ length: numMessages }, (_, i) => ({
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Message ${i + 1} of ${numMessages}: Generate a helpful response.`,
        },
      }));
      return { messages };
    },
  );
}
