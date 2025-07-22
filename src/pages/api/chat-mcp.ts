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
    
    // Specifik felhantering för olika typer av fel
    let userFriendlyMessage = 'Ett oväntat fel uppstod. Försök igen senare.';
    
    if (err instanceof Error) {
      const errorMessage = err.message;
      
      // Hugging Face credit limit fel
      if (errorMessage.includes('exceeded your monthly included credits')) {
        userFriendlyMessage = `🚫 **AI-tjänsten är tillfälligt otillgänglig**

Månadskvoten för AI-anrop har överskridits. För att fortsätta använda AI-chatten behöver kontot uppgraderas till PRO-version.

💡 **Alternativ:**
- Vänta till nästa månad när kvoten återställs
- Uppgradera till PRO för fler månadsanrop
- Använd task-hanteringen manuellt via gränssnittet

MCP-tools (databas-funktioner) fungerar fortfarande normalt.`;
      }
      // Databasanslutning fel
      else if (errorMessage.includes('Database not available')) {
        userFriendlyMessage = `🔌 **Databasanslutning saknas**

Kunde inte ansluta till databasen. Kontrollera att Supabase-inställningarna är korrekt konfigurerade.

🔧 **Lösning:** Se till att miljövariablerna NEXT_PUBLIC_SUPABASE_URL och NEXT_PUBLIC_SUPABASE_ANON_KEY är inställda.`;
      }
      // MCP server fel
      else if (errorMessage.includes('Failed to connect to MCP server')) {
        userFriendlyMessage = `⚡ **MCP Server-anslutning misslyckades**

Kunde inte ansluta till den interna server som hanterar databas-operationer.

🔧 **Lösning:** Servern startar om automatiskt. Försök igen om en stund.`;
      }
      // Generiska API-fel
      else if (errorMessage.includes('API')) {
        userFriendlyMessage = `🌐 **API-tjänst otillgänglig**

Den externa AI-tjänsten svarar inte som förväntat.

💡 **Försök:** Vänta en stund och försök igen. Om problemet kvarstår kan det vara ett tillfälligt driftstopp.`;
      }
    }
    
    // Returnera användarvänligt felmeddelande som chat-response
    res.status(200).json({
      choices: [{
        message: {
          role: 'assistant',
          content: userFriendlyMessage
        }
      }]
    });
  }
} 