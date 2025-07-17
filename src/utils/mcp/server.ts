
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { supabase } from "@/lib/supaBase";

const server = new McpServer({
  name: 'Database-Server',
  description: 'Server to manage tasks, projects and customers etc..',
  version: '1.0.0',
});

// Register tool: Get Task by Customer Name
server.tool(
  'Get_Task_By_CustomerID',
  'Returns all tasks connected to a customer. Parametrar: { customer: Name of the customer }',
  { customer: z.string() },
  async ({ customer }: { customer: string }) => {
    const { data: customerData, error: customerError } = await supabase
      .from('Customer')
      .select('id')
        .eq('name', customer)
      .single();
    if (customerError || !customer) throw new Error('Customer not found');
    const { data, error } = await supabase
      .from('Task')
      .select(
        `*, parent:parentId(*), subtasks:Task(*), customer:customerId(name), project:projectId(title)`
      )
      .eq('customerId', customerData.id);
    if (error) throw error;
    return {
      content: [
        { type: 'text', text: JSON.stringify(data) },
        {
          type: 'resource',
          resource: {
            uri: '',
            text: JSON.stringify(data),
            mimeType: 'application/json',
          },
        },
      ],
    };
  }
);

server.tool(
  'Get_Task_By_ProjectID',
  'Returns all tasks connected to a project. Parametrar: { project: Name of the project }',
  { project: z.string() },
  async ({ project }: { project: string }) => {
    const { data: projectData, error: projectError } = await supabase
      .from('Project')
      .select('id')
      .eq('title', project)
      .single();
    if (projectError || !projectData) throw new Error('Project not found');
    const { data, error } = await supabase
      .from('Task')
      .select(
        `*, parent:parentId(*), subtasks:Task(*), customer:customerId(name), project:projectId(title)`
      )
      .eq('projectId', projectData.id);
    if (error) throw error;
    return {
      content: [
        { type: 'text', text: JSON.stringify(data) },
        { type: 'resource', resource: { uri: '', text: JSON.stringify(data), mimeType: 'application/json' } },
      ],
    };
  }
);

const transport = new StdioServerTransport();
(async () => {
  await server.connect(transport);
})();