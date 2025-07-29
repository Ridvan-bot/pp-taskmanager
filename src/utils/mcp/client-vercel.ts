import { InferenceClient } from '@huggingface/inference';
import { ChatMessage } from '@/types';

// Check if HF_TOKEN is available
if (!process.env.HF_TOKEN) {
  console.warn('⚠️  HF_TOKEN environment variable not found. Hugging Face inference will not work.');
}

const hfClient = new InferenceClient(process.env.HF_TOKEN);

export const createChatCompletion = async (
  messages: ChatMessage[],
  tools?: unknown[],
): Promise<unknown> => {
  if (!process.env.HF_TOKEN) {
    throw new Error('HF_TOKEN environment variable is required');
  }

  const chatCompletion = await hfClient.chatCompletion({
    provider: 'together',
    model: 'moonshotai/Kimi-K2-Instruct',
    messages,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: (tools || []) as any,
  });
  
  return chatCompletion;
};

// Mock functions for tools - replace with direct database calls
export const getToolsviaMcp = async () => {
  // Return available tools that can be handled by your API routes
  const functions = [
    {
      name: 'create_task',
      description: 'Create a new task',
      parameters: {
        type: 'object',
        properties: {
          taskTitel: { type: 'string' },
          projektNamn: { type: 'string' },
          kundNamn: { type: 'string' },
          content: { type: 'string' },
          priority: { type: 'string' },
          status: { type: 'string' }
        }
      }
    },
    // Add other tools as needed
  ];
  
  return { functions, response: { tools: functions } };
};

export const callToolsViaMcp = async (
  name: string,
  functionArgument: { [key: string]: unknown },
): Promise<unknown> => {
  // Instead of MCP, call your existing API routes
  const response = await fetch('/api/tools', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      funcArguments: functionArgument
    })
  });
  
  if (!response.ok) {
    throw new Error(`Tool call failed: ${response.statusText}`);
  }
  
  return await response.json();
}; 