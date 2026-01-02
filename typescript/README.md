# MCP Test Kits - TypeScript

Build from source using the official MCP SDK.

## Build

```bash
cd typescript
npm install
npm run build
```

---

## stdio

```json
{
  "mcpServers": {
    "mcp-test-kits": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/mcp-test-kits/typescript",
      "transport": "stdio"
    }
  }
}
```

---

## HTTP

Start server:
```bash
node dist/index.js --transport http --port 3000
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

---

## SSE

Start server:
```bash
node dist/index.js --transport sse --port 3000
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
npx @modelcontextprotocol/inspector node dist/index.js

# HTTP (start server first: node dist/index.js --transport http --port 3000)
npx @modelcontextprotocol/inspector --transport http --server-url http://localhost:3000/mcp

# SSE (start server first: node dist/index.js --transport sse --port 3000)
npx @modelcontextprotocol/inspector --transport sse --server-url http://localhost:3000/sse
```

---

## Development

```bash
npm run dev        # Run with tsx
npm run build      # Build to dist/
npm run typecheck  # Type check
npm run lint       # Lint code
npm test           # Run tests
```
