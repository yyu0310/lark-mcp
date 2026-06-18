#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';

const server = new Server(
  { name: 'lark-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', timeout: 30000 });
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'lark_wiki_spaces',
      description: 'List all Lark wiki spaces (e.g. BD and IR Knowledge Base)',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'lark_wiki_nodes',
      description: 'List pages/nodes inside a Lark wiki space',
      inputSchema: {
        type: 'object',
        properties: {
          space_id: { type: 'string', description: 'Wiki space ID from lark_wiki_spaces' },
          parent_node_token: { type: 'string', description: 'Parent node token to list children (optional)' }
        },
        required: ['space_id']
      }
    },
    {
      name: 'lark_wiki_read',
      description: 'Read the markdown content of a Lark wiki page or document by URL',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Full Lark document URL (e.g. https://fz54yjvzmo.sg.larksuite.com/wiki/...)' }
        },
        required: ['url']
      }
    },
    {
      name: 'lark_doc_read',
      description: 'Read a Lark document by its obj_token (docx token)',
      inputSchema: {
        type: 'object',
        properties: {
          obj_token: { type: 'string', description: 'Document obj_token from lark_wiki_nodes' }
        },
        required: ['obj_token']
      }
    },
    {
      name: 'lark_im_search',
      description: 'Search Lark messages',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' }
        },
        required: ['query']
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    let result;
    if (name === 'lark_wiki_spaces') {
      result = run('lark-cli wiki +space-list');
    } else if (name === 'lark_wiki_nodes') {
      const parent = args.parent_node_token ? ` --parent-node-token ${args.parent_node_token}` : '';
      result = run(`lark-cli wiki +node-list --space-id ${args.space_id}${parent}`);
    } else if (name === 'lark_wiki_read') {
      result = run(`lark-cli docs +fetch --doc "${args.url}" --api-version v2`);
    } else if (name === 'lark_doc_read') {
      result = run(`lark-cli docs +fetch --doc ${args.obj_token} --api-version v2`);
    } else if (name === 'lark_im_search') {
      result = run(`lark-cli im +messages-search --query "${args.query}"`);
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
    return { content: [{ type: 'text', text: result }] };
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
