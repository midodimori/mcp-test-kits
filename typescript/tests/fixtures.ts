/**
 * Shared test fixtures for integration tests.
 */

import { spawn, type ChildProcess } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

/**
 * Create an MCP client connected via stdio transport.
 */
export async function createStdioClient(): Promise<{
    client: Client;
    close: () => Promise<void>;
}> {
    const transport = new StdioClientTransport({
        command: "npx",
        args: ["tsx", "src/index.ts"],
    });

    const client = new Client({
        name: "test-client",
        version: "1.0.0",
    });

    await client.connect(transport);

    return {
        client,
        close: async () => {
            await client.close();
        },
    };
}

/**
 * Start an HTTP server and return the base URL.
 */
export async function startHttpServer(port: number = 3001): Promise<{
    url: string;
    stop: () => void;
}> {
    const proc = spawn("npx", ["tsx", "src/index.ts", "--transport", "http", "--port", String(port)], {
        stdio: ["pipe", "pipe", "pipe"],
    });

    // Wait for server to start
    await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => resolve(), 3000);
        proc.stderr?.on("data", (data: Buffer) => {
            if (data.toString().includes("listening")) {
                clearTimeout(timeout);
                resolve();
            }
        });
        proc.on("error", reject);
    });

    return {
        url: `http://localhost:${port}`,
        stop: () => {
            proc.kill();
        },
    };
}

/**
 * Start an SSE server and return the base URL.
 */
export async function startSseServer(port: number = 3002): Promise<{
    url: string;
    stop: () => void;
}> {
    const proc = spawn("npx", ["tsx", "src/index.ts", "--transport", "sse", "--port", String(port)], {
        stdio: ["pipe", "pipe", "pipe"],
    });

    // Wait for server to start
    await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => resolve(), 3000);
        proc.stderr?.on("data", (data: Buffer) => {
            if (data.toString().includes("listening")) {
                clearTimeout(timeout);
                resolve();
            }
        });
        proc.on("error", reject);
    });

    return {
        url: `http://localhost:${port}`,
        stop: () => {
            proc.kill();
        },
    };
}

/**
 * Create an MCP client connected via HTTP transport.
 */
export async function createHttpClient(serverUrl: string): Promise<{
    client: Client;
    close: () => Promise<void>;
}> {
    const transport = new StreamableHTTPClientTransport(new URL(`${serverUrl}/mcp`));

    const client = new Client({
        name: "test-client",
        version: "1.0.0",
    });

    await client.connect(transport);

    return {
        client,
        close: async () => {
            await client.close();
        },
    };
}

/**
 * Create an MCP client connected via SSE transport.
 */
export async function createSseClient(serverUrl: string): Promise<{
    client: Client;
    close: () => Promise<void>;
}> {
    const transport = new SSEClientTransport(new URL(`${serverUrl}/sse`));

    const client = new Client({
        name: "test-client",
        version: "1.0.0",
    });

    await client.connect(transport);

    return {
        client,
        close: async () => {
            await client.close();
        },
    };
}
