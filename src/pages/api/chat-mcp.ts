import type { NextApiRequest, NextApiResponse } from 'next';
import { createChatCompletion, getToolsviaMcp, callToolsViaMcp } from '@/utils/mcp/client';

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
      tool_calls?: Array<{
        id: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
  }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { messages } = req.body;
    // Hämta tillgängliga MCP tools
    const { functions: mcpTools } = await getToolsviaMcp();
    // Konvertera MCP tools till format som LLM förstår
    const toolsForLLM = mcpTools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description || `Tool: ${tool.name}`,
        parameters: tool.parameters || {}
      }
    }));
    
    // Skicka meddelanden och tools till LLM
    const result = await createChatCompletion(messages, toolsForLLM) as ChatCompletionResponse;
    
    // Kolla om LLM vill använda tools
    const responseMessage = result?.choices?.[0]?.message;
    
    if (responseMessage?.tool_calls) {
      
      // Exekvera tool calls
      const toolResults = [];
      for (const toolCall of responseMessage.tool_calls) {
        try {
          const toolResult = await callToolsViaMcp(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments)
          );
          toolResults.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            content: JSON.stringify(toolResult)
          });
        } catch (error) {
          console.error(`❌ Error calling tool ${toolCall.function.name}:`, error);
          toolResults.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            content: `Error: ${error}`
          });
        }
      }
      
      // Skicka tool results tillbaka till LLM för final response
      const finalMessages = [
        ...messages,
        responseMessage,
        ...toolResults
      ];
      
      const finalResult = await createChatCompletion(finalMessages, toolsForLLM);
      res.status(200).json(finalResult);
    } else {
      // Ingen tool call, returnera vanligt svar
      res.status(200).json(result);
    }
    
  } catch (err) {
    console.error('❌ MCP error:', err);
    res.status(500).json({ error: 'MCP error', details: String(err) });
  }
} 