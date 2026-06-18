# lark-mcp — Agent Context

An MCP server that wraps [lark-cli](https://github.com/larksuite/cli) to expose Lark wiki, docs, and IM search as MCP tools for Claude Desktop App and other MCP-compatible AI assistants.

## Project structure

| File | Purpose |
|---|---|
| `server.js` | MCP server entry point (~100 lines) |
| `package.json` | Node.js dependencies |
| `README.md` | English docs |
| `README.zh-TW.md` | Traditional Chinese docs |
| `README.zh-CN.md` | Simplified Chinese docs |

## Key design decisions

- **Zero credentials in config** — all Lark API calls route through `lark-cli`, which manages its own OAuth token store. `server.js` reads no env vars.
- **execSync over async** — lark-cli is a local CLI; sync calls are simpler and the 30s timeout is sufficient.
- **Five read-only tools** — wiki spaces, wiki nodes, wiki read, doc read, IM search. Write operations are intentionally omitted.

## Adding a new tool

1. Add an entry to the `ListToolsRequestSchema` handler: `{ name, description, inputSchema }`
2. Add a handler branch in `CallToolRequestSchema` that calls the relevant `lark-cli` subcommand

## Auth

```bash
lark-cli auth login --domain wiki,docs,drive,im --no-wait --json
lark-cli auth login --device-code <code>
```

Token valid for 7 days. Re-login when expired.
