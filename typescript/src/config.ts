/**
 * Configuration types for MCP Test Kits
 */

export interface ServerConfig {
  name: string;
  version: string;
}

export interface NetworkConfig {
  host: string;
  port: number;
}

export interface TransportConfig {
  type: "stdio" | "http" | "sse";
  network: NetworkConfig;
}

export interface CapabilitiesConfig {
  tools: boolean;
  resources: boolean;
  prompts: boolean;
}

export interface ConfigOptions {
  server: ServerConfig;
  transport: TransportConfig;
  capabilities: CapabilitiesConfig;
}

/**
 * Configuration class with default values
 */
export class Config implements ConfigOptions {
  server: ServerConfig;
  transport: TransportConfig;
  capabilities: CapabilitiesConfig;

  constructor(options?: Partial<ConfigOptions>) {
    this.server = {
      name: options?.server?.name ?? "mcp-test-kits",
      version: options?.server?.version ?? "1.0.0",
    };

    this.transport = {
      type: options?.transport?.type ?? "stdio",
      network: {
        host: options?.transport?.network?.host ?? "127.0.0.1",
        port: options?.transport?.network?.port ?? 3000,
      },
    };

    this.capabilities = {
      tools: options?.capabilities?.tools ?? true,
      resources: options?.capabilities?.resources ?? true,
      prompts: options?.capabilities?.prompts ?? true,
    };
  }
}
