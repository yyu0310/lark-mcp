# lark-mcp

讓 Claude Desktop App 能直接讀取你的 Lark 工作區的 wiki 文件、訊息與文件內容。

> 基於 Larksuite 官方 [lark-cli](https://github.com/larksuite/cli) 構建。

---

## 什麼是 MCP

MCP（Model Context Protocol）是一種讓 Claude 連接外部工具的標準協議。

沒有 MCP 時，Claude 只能回答你輸入的內容。有了 MCP，Claude 可以主動去查外部資料，例如讀取 Lark 文件、搜尋 Lark 訊息，再把結果整合進回答裡。

這個 MCP server 的作用：當你問 Claude「your-lark-wiki-name 裡有什麼？」，Claude 會自動呼叫 Lark API 取得資料，不需要你手動複製貼上。

---

## 功能

| 工具 | 說明 |
|---|---|
| `lark_wiki_spaces` | 列出所有 wiki 空間（如 your-lark-wiki-name） |
| `lark_wiki_nodes` | 列出 wiki 空間內的頁面清單 |
| `lark_wiki_read` | 以 URL 讀取 wiki 頁面的 markdown 內容 |
| `lark_doc_read` | 以 obj_token 讀取文件內容 |
| `lark_im_search` | 搜尋 Lark 訊息 |

---

## 安裝步驟

### 前置條件
- 安裝 [Node.js](https://nodejs.org/)（v18+）
- 安裝 [Claude Desktop App](https://claude.ai/download)

### 1. Clone 這個 repo

```bash
git clone https://github.com/yyu0310/lark-mcp.git
cd lark-mcp
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 安裝 Lark CLI 並認證

```bash
npx @larksuite/cli@latest install
lark-cli auth login --domain wiki,docs,drive,im --no-wait --json
# 開授權連結 → 完成後跑：
lark-cli auth login --device-code <code>
```

> 注意：請向管理員取得 Lark App ID 與 App Secret，或自行在 Lark Developer Console 建立新 app 並請 workspace 管理員批准。

### 4. 設定 Claude Desktop App

開 `~/Library/Application Support/Claude/claude_desktop_config.json`，加入：

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

路徑換成實際放置的位置。

### 5. 重啟 Claude Desktop App

Settings → Developer → 確認 `lark` 狀態為 **running**。

---

## 使用範例

- 「幫我列出 your-lark-wiki-name 裡的所有頁面」
- 「讀取 Important Materials 的內容」
- 「搜尋關於 [keyword] 的 Lark 訊息」

---

## 加入其他 MCP 相容工具

任何讀取 `~/.gemini/config/mcp_config.json` 的 AI 工具（如 Gemini CLI）均可用相同方式設定：

開 `~/.gemini/config/mcp_config.json`，加入：

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

注意：`env` 欄位不需要填，憑證由 `lark-cli` 自己管理（見下方憑證架構說明）。

---

## 憑證架構說明

這個 MCP server 的認證方式和一般 MCP 不同，**憑證完全不在 `mcp_config.json` 裡**。

一般 MCP 的做法：
```json
"env": { "API_KEY": "明文 key" }   ← 憑證嵌在 JSON（有洩漏風險）
```

Lark MCP 的做法：
- `server.js` 不讀任何環境變數
- 所有 Lark API 呼叫都透過 `lark-cli` CLI 工具執行
- `lark-cli` 自己管理 OAuth token（存在 `lark-cli` 的設定目錄）
- MCP config 裡只放 `command` 和 `args`，零憑證

優點：MCP config 檔案即使被看到，也不含任何 API key 或 token。

---

## 已知限制

- Token 有效期 7 天，過期後需重跑 `lark-cli auth login`
- Claude Desktop App 才支援 MCP，claude.ai 網頁版不支援
- `im:chat:create_by_user`、`im:feed.flag` 未授予，不影響讀取功能
