import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ChatMessage } from '@/types';
import dotenv from 'dotenv';
import path from 'path';
import { InferenceClient } from '@huggingface/inference';

dotenv.config();

const hfClient = new InferenceClient(process.env.HF_TOKEN);

export const createChatCompletion = async (
  messages: ChatMessage[],
  tools?: unknown[],
): Promise<unknown> => {
  console.log('🤖 Sending to LLM:', {
    messages: messages.length,
    tools: tools?.length || 0,
    toolNames: tools?.map((t: unknown) => {
      const toolObj = t as { function?: { name?: string }; name?: string };
      return toolObj.function?.name || toolObj.name || 'unknown';
    }) || []
  });

  const chatCompletion = await hfClient.chatCompletion({
    provider: 'together',
    model: 'moonshotai/Kimi-K2-Instruct',
    messages,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: (tools || []) as any,
  });
  
  console.log('✅ LLM Response received');
  return chatCompletion;
};

// Robust path to server.ts
const serverPath = path.resolve(process.cwd(), 'src/utils/mcp/server.ts');
console.log('🔍 Starting MCP server');

const transport = new StdioClientTransport({
  command: 'ts-node',
  args: [serverPath],
  env: {
    ...process.env,
    // Ensure environment variables are passed to the server process
    NODE_ENV: process.env.NODE_ENV || 'development',
  }
});

const client = new Client(
  {
    name: 'Database-client',
    version: '1.0.0',
  },
  {
    capabilities: {
      prompts: {},
      resources: {},
      tools: {},
    },
  },
);

// Type for tools
interface Tool {
  name: string;
  description?: string;
  inputSchema: unknown;
}

// Listing tools in MCP server
export const getToolsviaMcp = async () => {
  try {
    const response = await client.listTools();
    const functions = response.tools.map((tool: Tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    }));
    return { functions, response };
  } catch (error) {
    console.error('❌ Error listing MCP tools:', error);
    throw error;
  }
};

export const callToolsViaMcp = async (
  name: string,
  functionArgument: { [key: string]: unknown },
): Promise<unknown> => {
  try {
    const response = await client.callTool({
      name: name,
      arguments: functionArgument,
    });
    return response;
  } catch (error) {
    console.error('❌ Error calling MCP tool:', error);
    throw error;
  }
};

// Initialize connection with better error handling
(async () => {
  try {
    console.log('🚀 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ MCP client connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to MCP server:', error);
  }
})();

// export a function to close the connection
export const closeConnection = async (): Promise<void> => {
  try {
    await client.close();
    console.log('✅ MCP connection closed');
  } catch (error) {
    console.error('❌ Error closing MCP connection:', error);
  }
};