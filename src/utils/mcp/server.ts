
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';


const server = new McpServer({
  name: 'Database-Server',
  description: 'Server to manage tasks, projects and customers etc..',
  version: '1.0.0',
});

// Register all tools



const transport = new StdioServerTransport();
(async () => {
  await server.connect(transport);
})();