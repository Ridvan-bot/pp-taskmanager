import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ChatMessage } from '@/types';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const createChatCompletion = async (
    messages: ChatMessage[],
  ): Promise<unknown> => {

    const model = 'meta-llama/Llama-3-8b-chat-hf';
    const url = `https://api-inference.huggingface.co/models/${model}`;
  
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: messages,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.7,
        },
      }),
    });
  
    if (!res.ok) {
      throw new Error(`Hugging Face API error: ${res.status} ${await res.text()}`);
    }
  
    return res.json();
  };

// Robust path to server.js
const serverPath = path.resolve(process.cwd(), 'src/utils/mcp/server.js');
const transport = new StdioClientTransport({
  command: 'node',
  args: [serverPath],
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
  const response = await client.listTools();
  const functions = response.tools.map((tool: Tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
  }));
  return { functions, response };
};

export const callToolsViaMcp = async (
  name: string,
  functionArgument: { [key: string]: unknown },
): Promise<unknown> => {
  const response = await client.callTool({
    name: name,
    arguments: functionArgument,
  });
  return response;
};

// Starta anslutning utan att använda variabel
void client.connect(transport);

// export a function to close the connection
export const closeConnection = async (): Promise<void> => {
  await client.close();
};