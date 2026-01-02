/**
 * Integration tests via stdio transport.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createStdioClient } from "./fixtures.js";

describe("Stdio Transport", () => {
    let client: Client;
    let close: () => Promise<void>;

    beforeAll(async () => {
        const conn = await createStdioClient();
        client = conn.client;
        close = conn.close;
    });

    afterAll(async () => {
        await close();
    });

    describe("Tools", () => {
        it("should echo message", async () => {
            const result = await client.callTool({ name: "echo", arguments: { message: "hello" } });
            expect((result.content as Array<{ type: string; text: string }>)[0].text).toBe("hello");
        });

        it("should add numbers", async () => {
            const result = await client.callTool({ name: "add", arguments: { a: 5, b: 3 } });
            expect(Number((result.content as Array<{ type: string; text: string }>)[0].text)).toBe(8);
        });

        it("should multiply numbers", async () => {
            const result = await client.callTool({ name: "multiply", arguments: { x: 4, y: 7 } });
            expect(Number((result.content as Array<{ type: string; text: string }>)[0].text)).toBe(28);
        });

        it("should reverse string", async () => {
            const result = await client.callTool({ name: "reverse_string", arguments: { text: "hello" } });
            expect((result.content as Array<{ type: string; text: string }>)[0].text).toBe("olleh");
        });

        it("should generate valid UUID", async () => {
            const result = await client.callTool({ name: "generate_uuid", arguments: {} });
            const uuid = (result.content as Array<{ type: string; text: string }>)[0].text;
            // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        });

        it("should get timestamp", async () => {
            const result = await client.callTool({ name: "get_timestamp", arguments: { format: "iso" } });
            const timestamp = (result.content as Array<{ type: string; text: string }>)[0].text;
            expect(timestamp).toContain("T");
        });

        it("should return error for sample_error tool", async () => {
            const result = await client.callTool({ name: "sample_error", arguments: {} });
            expect(result.isError).toBe(true);
        });
    });

    describe("Resources", () => {
        it("should list resources", async () => {
            const result = await client.listResources();
            const uris = result.resources.map((r) => r.uri);
            expect(uris).toContain("test://static/greeting");
        });

        it("should read static greeting", async () => {
            const result = await client.readResource({ uri: "test://static/greeting" });
            expect((result.contents[0] as { text: string }).text).toContain("Hello");
        });

        it("should read dynamic timestamp", async () => {
            const result = await client.readResource({ uri: "test://dynamic/timestamp" });
            expect((result.contents[0] as { text: string }).text).toContain("T");
        });
    });

    describe("Prompts", () => {
        it("should list prompts", async () => {
            const result = await client.listPrompts();
            const names = result.prompts.map((p) => p.name);
            expect(names).toContain("simple_prompt");
        });

        it("should get simple prompt", async () => {
            const result = await client.getPrompt({ name: "simple_prompt" });
            expect(result.messages.length).toBeGreaterThanOrEqual(1);
        });

        it("should get greeting prompt with argument", async () => {
            const result = await client.getPrompt({ name: "greeting_prompt", arguments: { name: "Alice" } });
            expect((result.messages[0].content as { type: string; text: string }).text).toContain("Alice");
        });
    });
});
