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
  'Returns task titles for a specific customer. Parameter: { customer: Name of the customer }',
  { customer: z.string() },
  async ({ customer }: { customer: string }) => {
    if (!supabase) {
      throw new Error('Database not available. Please configure Supabase environment variables.');
    }
    
    try {
      // STEG 1: Hitta customer ID baserat på customer name
      const { data: customerData, error: customerError } = await supabase
        .from('Customer')
        .select('id, name')
        .eq('name', customer)
        .single();
        
      if (customerError) {
        console.error('Customer lookup error:', customerError);
        throw new Error(`Customer '${customer}' not found`);
      }
      
      if (!customerData) {
        throw new Error(`Customer '${customer}' not found`);
      }

      // STEG 2: Hämta alla tasks som har customerId = det ID vi just hittade
      const { data: tasks, error: tasksError } = await supabase
        .from('Task')
        .select('title')
        .eq('customerId', customerData.id);
        
      if (tasksError) {
        console.error('Tasks lookup error:', tasksError);
        throw new Error('Failed to fetch tasks');
      }
      
      // STEG 3: Extrahera bara titlarna
      const taskTitles = tasks?.map(task => task.title) || [];
      
      return {
        content: [
          { 
            type: 'text', 
            text: taskTitles.length > 0 
              ? `Customer "${customerData.name}" (ID: ${customerData.id}) has ${taskTitles.length} tasks: ${taskTitles.join(', ')}`
              : `Customer "${customerData.name}" (ID: ${customerData.id}) has no tasks`
          },
        ],
      };
    } catch (error) {
      console.error('Error in Get_Task_By_CustomerID:', error);
      throw error;
    }
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
  } catch (error) {
    console.error('❌ Failed to start MCP Server:', error);
    process.exit(1);
  }
})();