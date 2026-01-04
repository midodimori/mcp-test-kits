# MCP Test Kits - Docker

Build Docker images from source.

## Build

```bash
# From project root
docker build -f docker/Dockerfile.python -t mcp-test-kits:python .
docker build -f docker/Dockerfile.typescript -t mcp-test-kits:typescript .
```

---

## stdio

```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp-test-kits:python"],
      "transport": "stdio"
    }
  }
}
```

---

## HTTP

Start server:
```bash
docker run -p 3000:3000 mcp-test-kits:python --transport http --host 0.0.0.0
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

### With OAuth

Start server:
```bash
docker run -p 3000:3000 mcp-test-kits:python --transport http --host 0.0.0.0 --enable-oauth
# or auto-approve for testing
docker run -p 3000:3000 mcp-test-kits:python --transport http --host 0.0.0.0 --enable-oauth --oauth-auto-approve
```

MCP client config (OAuth discovery automatic):
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

Or with pre-obtained token:
```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "url": "http://localhost:3000/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer YOUR_ACCESS_TOKEN"
      }
    }
  }
}
```

---

## SSE

Start server:
```bash
docker run -p 3000:3000 mcp-test-kits:python --transport sse --host 0.0.0.0
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

### With OAuth

Start server:
```bash
docker run -p 3000:3000 mcp-test-kits:python --transport sse --host 0.0.0.0 --enable-oauth
# or auto-approve for testing
docker run -p 3000:3000 mcp-test-kits:python --transport sse --host 0.0.0.0 --enable-oauth --oauth-auto-approve
```

MCP client config (OAuth discovery automatic):
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

Or with pre-obtained token:
```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "url": "http://localhost:3000/sse",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer YOUR_ACCESS_TOKEN"
      }
    }
  }
}
```

---

## Test with MCP Inspector

```bash
# stdio
npx @modelcontextprotocol/inspector docker run -i --rm mcp-test-kits:python

# HTTP (start server first)
npx @modelcontextprotocol/inspector --transport http --server-url http://localhost:3000/mcp

# SSE (start server first)
npx @modelcontextprotocol/inspector --transport sse --server-url http://localhost:3000/sse
```
