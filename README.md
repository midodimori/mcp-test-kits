# MCP Test Kits

A comprehensive MCP testing server for debugging and testing MCP clients. Available in Python and TypeScript.

## Capabilities

- **8 Tools**: echo, add, multiply, reverse_string, generate_uuid, get_timestamp, sample_error, long_running_task
- **5 Resources**: test://static/greeting, test://static/numbers, test://dynamic/timestamp, test://dynamic/random, test://large-text
- **4 Prompts**: simple_prompt, greeting_prompt, template_prompt, multi_message_prompt

## Quick Start

| Method | Guide |
|--------|-------|
| **uvx / npx / docker registry** | [remote/README.md](remote/README.md) |
| **Python from source** | [python/README.md](python/README.md) |
| **TypeScript from source** | [typescript/README.md](typescript/README.md) |
| **Docker from source** | [docker/README.md](docker/README.md) |

## CLI Options

All implementations share the same CLI:

| Flag | Description | Default |
|------|-------------|---------|
| `-t, --transport` | stdio, http, sse | stdio |
| `--host` | Bind address | localhost |
| `-p, --port` | Port number | 3000 |
| `-l, --log-level` | debug, info, warn, error | info |
| `--no-tools` | Disable tools | false |
| `--no-resources` | Disable resources | false |
| `--no-prompts` | Disable prompts | false |

## Development

```bash
make setup       # Install hooks + build
make precommit   # Lint-fix + spec-compare
make build       # Build both
make test        # Test both
```

## License

MIT
