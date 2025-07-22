import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load environment variables from multiple possible locations
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Check if Supabase environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
  }
} else {
  console.warn('⚠️  Supabase environment variables not found. Database tools will be disabled.');
  console.warn('   Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable database features.');
}

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
    if (!supabase) {
      throw new Error('Database not available. Please configure Supabase environment variables.');
    }
    
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

// Register tool: Get All Customers
server.tool(
  'Get_All_Customers',
  'Returns all customers from the database. No parameters required.',
  {},
  async () => {
    if (!supabase) {
      throw new Error('Database not available. Please configure Supabase environment variables.');
    }
    const { data, error } = await supabase
      .from('Customer')
      .select('*')
      .order('name', { ascending: true });
      
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
    if (!supabase) {
      throw new Error('Database not available. Please configure Supabase environment variables.');
    } 
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
  try {
    await server.connect(transport);
    console.log('🚀 MCP Server started successfully');
  } catch (error) {
    console.error('❌ Failed to start MCP Server:', error);
    process.exit(1);
  }
})();