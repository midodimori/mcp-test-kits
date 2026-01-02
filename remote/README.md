# MCP Test Kits - Remote

Run without cloning the repository.

---

## Python (uvx)

### stdio

```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "command": "uvx",
      "args": ["mcp-test-kits"],
      "transport": "stdio"
    }
  }
}
```

### HTTP

Start server:
```bash
uvx mcp-test-kits --transport http --port 3000
```

MCP client config:
```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "url": "http://localhost:3000/mcp",
      "transport": "http"
    }
  }
}
```

### SSE

Start server:
```bash
uvx mcp-test-kits --transport sse --port 3000
```

MCP client config:
```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "url": "http://localhost:3000/sse",
      "transport": "sse"
    }
  }
}
```

---

## TypeScript (npx)

### stdio

```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "command": "npx",
      "args": ["-y", "mcp-test-kits"],
      "transport": "stdio"
    }
  }
}
```

### HTTP

Start server:
```bash
npx -y mcp-test-kits --transport http --port 3000
```

MCP client config:
```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "url": "http://localhost:3000/mcp",
      "transport": "http"
    }
  }
}
```

### SSE

Start server:
```bash
npx -y mcp-test-kits --transport sse --port 3000
```

MCP client config:
```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "url": "http://localhost:3000/sse",
      "transport": "sse"
    }
  }
}
```

---

## Docker Registry

### stdio

```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "ghcr.io/midodimori/mcp-test-kits-python"],
      "transport": "stdio"
    }
  }
}
```

### HTTP

Start server:
```bash
docker run -p 3000:3000 ghcr.io/midodimori/mcp-test-kits-python --transport http --host 0.0.0.0
```

MCP client config:
```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "url": "http://localhost:3000/mcp",
      "transport": "http"
    }
  }
}
```

### SSE

Start server:
```bash
docker run -p 3000:3000 ghcr.io/midodimori/mcp-test-kits-python --transport sse --host 0.0.0.0
```

MCP client config:
```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "url": "http://localhost:3000/sse",
      "transport": "sse"
    }
  }
}
```

---

## Test with MCP Inspector

```bash
# stdio
npx @modelcontextprotocol/inspector uvx mcp-test-kits

# HTTP (start server first: uvx mcp-test-kits --transport http --port 3000)
npx @modelcontextprotocol/inspector --transport http --server-url http://localhost:3000/mcp

# SSE (start server first: uvx mcp-test-kits --transport sse --port 3000)
npx @modelcontextprotocol/inspector --transport sse --server-url http://localhost:3000/sse
```
