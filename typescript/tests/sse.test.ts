/**
 * Integration tests via SSE transport - smoke test only.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { startSseServer, createSseClient } from "./fixtures.js";

describe("SSE Transport", () => {
    let serverUrl: string;
    let stopServer: () => void;
    let client: Client;
    let closeClient: () => Promise<void>;

    beforeAll(async () => {
        const server = await startSseServer(3002);
        serverUrl = server.url;
        stopServer = server.stop;

        const conn = await createSseClient(serverUrl);
        client = conn.client;
        closeClient = conn.close;
    });

    afterAll(async () => {
        await closeClient();
        stopServer();
    });

    it("should connect and call echo tool", async () => {
        const result = await client.callTool({ name: "echo", arguments: { message: "test" } });
        expect((result.content as Array<{ type: string; text: string }>)[0].text).toBe("test");
    });
});
