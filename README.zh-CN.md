# lark-mcp

让 Claude Desktop App 能直接读取你的 Lark 工作区的 wiki 文档、消息与文件内容。

> 基于 Larksuite 官方 [lark-cli](https://github.com/larksuite/cli) 构建。

---

## 什么是 MCP

MCP（Model Context Protocol）是一种让 Claude 连接外部工具的标准协议。

没有 MCP 时，Claude 只能回答你输入的内容。有了 MCP，Claude 可以主动去查外部资料，例如读取 Lark 文档、搜索 Lark 消息，再把结果整合进回答里。

---

## 功能

| 工具 | 说明 |
|---|---|
| `lark_wiki_spaces` | 列出所有 wiki 空间 |
| `lark_wiki_nodes` | 列出 wiki 空间内的页面清单 |
| `lark_wiki_read` | 以 URL 读取 wiki 页面的 markdown 内容 |
| `lark_doc_read` | 以 obj_token 读取文档内容 |
| `lark_im_search` | 搜索 Lark 消息 |

---

## 安装步骤

### 前置条件
- 安装 [Node.js](https://nodejs.org/)（v18+）
- 安装 [Claude Desktop App](https://claude.ai/download)

### 1. Clone 这个 repo

```bash
git clone https://github.com/yyu0310/lark-mcp.git
cd lark-mcp
```

### 2. 安装依赖

```bash
npm install
```

### 3. 安装 Lark CLI 并认证

```bash
npx @larksuite/cli@latest install
lark-cli auth login --domain wiki,docs,drive,im --no-wait --json
# 打开授权链接 → 完成后运行：
lark-cli auth login --device-code <code>
```

> 注意：请向管理员获取 Lark App ID 与 App Secret，或自行在 Lark Developer Console 创建新 app 并请 workspace 管理员批准。

### 4. 配置 Claude Desktop App

打开 `~/Library/Application Support/Claude/claude_desktop_config.json`，加入：

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

路径换成实际放置的位置。

### 5. 重启 Claude Desktop App

Settings → Developer → 确认 `lark` 状态为 **running**。

---

## 使用示例

- 「帮我列出 your-lark-wiki-name 里的所有页面」
- 「读取 Important Materials 的内容」
- 「搜索关于 [keyword] 的 Lark 消息」

---

## 凭证架构说明

- `server.js` 不读任何环境变量
- 所有 Lark API 调用都通过 `lark-cli` CLI 工具执行
- `lark-cli` 自己管理 OAuth token
- MCP config 里只放 `command` 和 `args`，零凭证

---

## 已知限制

- Token 有效期 7 天，过期后需重跑 `lark-cli auth login`
- Claude Desktop App 才支持 MCP，claude.ai 网页版不支持
- `im:chat:create_by_user`、`im:feed.flag` 可能未授予，不影响读取功能
