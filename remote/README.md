# MCP Test Kits - Remote

Run without cloning the repository.

---

## stdio

### Python (uvx)

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

### TypeScript (npx)

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

### Docker (ghcr.io)

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

---

## HTTP

### Python (uvx)

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

#### With OAuth

Start server:
```bash
uvx mcp-test-kits --transport http --port 3000 --enable-oauth
# or auto-approve for testing
uvx mcp-test-kits --transport http --port 3000 --enable-oauth --oauth-auto-approve
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

### TypeScript (npx)

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

#### With OAuth

Start server:
```bash
npx -y mcp-test-kits --transport http --port 3000 --enable-oauth
# or auto-approve for testing
npx -y mcp-test-kits --transport http --port 3000 --enable-oauth --oauth-auto-approve
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

### Docker (ghcr.io)

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

#### With OAuth

Start server:
```bash
docker run -p 3000:3000 ghcr.io/midodimori/mcp-test-kits-python --transport http --host 0.0.0.0 --enable-oauth
# or auto-approve for testing
docker run -p 3000:3000 ghcr.io/midodimori/mcp-test-kits-python --transport http --host 0.0.0.0 --enable-oauth --oauth-auto-approve
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

### Python (uvx)

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

#### With OAuth

Start server:
```bash
uvx mcp-test-kits --transport sse --port 3000 --enable-oauth
# or auto-approve for testing
uvx mcp-test-kits --transport sse --port 3000 --enable-oauth --oauth-auto-approve
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

### TypeScript (npx)

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

#### With OAuth

Start server:
```bash
npx -y mcp-test-kits --transport sse --port 3000 --enable-oauth
# or auto-approve for testing
npx -y mcp-test-kits --transport sse --port 3000 --enable-oauth --oauth-auto-approve
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

### Docker (ghcr.io)

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

#### With OAuth

Start server:
```bash
docker run -p 3000:3000 ghcr.io/midodimori/mcp-test-kits-python --transport sse --host 0.0.0.0 --enable-oauth
# or auto-approve for testing
docker run -p 3000:3000 ghcr.io/midodimori/mcp-test-kits-python --transport sse --host 0.0.0.0 --enable-oauth --oauth-auto-approve
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
npx @modelcontextprotocol/inspector uvx mcp-test-kits

# HTTP (start server first: uvx mcp-test-kits --transport http --port 3000)
npx @modelcontextprotocol/inspector --transport http --server-url http://localhost:3000/mcp

# SSE (start server first: uvx mcp-test-kits --transport sse --port 3000)
npx @modelcontextprotocol/inspector --transport sse --server-url http://localhost:3000/sse
```
