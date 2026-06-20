# lark-mcp

Connects Claude Desktop App to your Lark workspace, enabling Claude to read wiki pages, documents, and messages directly.

> Built on top of [lark-cli](https://github.com/larksuite/cli) by Larksuite.

---

## lark-mcp vs. lark-openapi-mcp (official)

Larksuite publishes an official MCP server: [@larksuiteoapi/lark-mcp](https://github.com/larksuite/lark-openapi-mcp). Both connect Claude to Lark, but they solve different problems.

| | **lark-mcp** (this repo) | **lark-openapi-mcp** (official) |
|---|---|---|
| **Setup** | No Lark App required | Requires App ID + App Secret from Lark Developer Console |
| **Credentials in MCP config** | None — lark-cli OAuth token store handles auth | Yes — App ID and Secret embedded in config |
| **Config shareable with teammates** | Safe to commit and share | Exposes credentials if shared |
| **Scope** | Read-only, 5 tools | Read + write, 700+ tools |
| **Identity** | Personal user (your own account) | Bot identity or user OAuth |
| **Best for** | Individuals who already use lark-cli and want zero-config MCP | Teams building automations, bots, or needing full API coverage |

**Choose lark-mcp when:** you use lark-cli day-to-day and want Claude to read your Lark content with no credential management.

**Choose lark-openapi-mcp when:** you need write operations, full API coverage, or are building a team-level integration.

---

## What is MCP

MCP (Model Context Protocol) is a standard that lets Claude connect to external tools and data sources.

Without MCP, Claude can only work with what you type into the chat. With MCP, Claude can actively fetch external data, such as reading Lark documents or searching Lark messages, and incorporate the results into its responses.

With this MCP server, when you ask Claude "What's in the your-lark-wiki-name?", Claude will call the Lark API automatically and return the content without you needing to copy and paste anything.

---

## Available Tools

| Tool | Description |
|---|---|
| `lark_wiki_spaces` | List all wiki spaces (e.g. your-lark-wiki-name) |
| `lark_wiki_nodes` | List pages inside a wiki space |
| `lark_wiki_read` | Read a wiki page's content by URL |
| `lark_doc_read` | Read a document by its obj_token |
| `lark_im_search` | Search Lark messages |

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Claude Desktop App](https://claude.ai/download)

### 1. Clone this repo

```bash
git clone https://github.com/yyu0310/lark-mcp.git
cd lark-mcp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Lark CLI and authenticate

```bash
npx @larksuite/cli@latest install
lark-cli auth login --domain wiki,docs,drive,im --no-wait --json
# Open the verification URL, then run:
lark-cli auth login --device-code <code>
```

> Note: Contact your workspace admin to obtain the Lark App ID and App Secret, or create your own app in the Lark Developer Console and request admin approval.

### 4. Configure Claude Desktop App

Open `~/Library/Application Support/Claude/claude_desktop_config.json` and add:

```json
{
  "mcpServers": {
    "lark": {
      "command": "node",
      "args": ["/Users/yourname/lark-mcp/server.js"]
    }
  }
}
```

Replace the path with the actual location of the folder on your machine.

### 5. Restart Claude Desktop App

Go to Settings → Developer and confirm that `lark` shows status **running**.

---

## Example Prompts

- "List all pages in your-lark-wiki-name"
- "Read the content of Important Materials"
- "Search Lark messages about [keyword]"

---

## Auth & Scope

| | |
|---|---|
| **Auth** | Managed by `lark-cli`'s OAuth token store. Nothing in the MCP config. |
| **Scope** | Read-only. All five tools are read operations, no writes. |
| **Config shareable** | Yes. `claude_desktop_config.json` contains only `command` and `args`, no secrets. |
| **Trust boundary** | Claude Desktop App → lark-mcp (local process) → lark-cli → Lark API |

---

## Known Limitations

- Auth token expires after 7 days. Re-run `lark-cli auth login` when it does.
- MCP is only supported in Claude Desktop App. The claude.ai web app does not support MCP.
- `im:chat:create_by_user` and `im:feed.flag` scopes may not be granted by your organization. This does not affect read access.
