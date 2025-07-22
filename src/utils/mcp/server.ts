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
  'Returns task titles for a specific project. Parameter: { project: Name of the project }',
  { project: z.string() },
  async ({ project }: { project: string }) => {
    if (!supabase) {
      throw new Error('Database not available. Please configure Supabase environment variables.');
    }
    
    try {
      // STEG 1: Hitta project ID baserat på project name
      const { data: projectData, error: projectError } = await supabase
        .from('Project')
        .select('id, title')
        .eq('title', project)
        .single();
        
      if (projectError) {
        console.error('Project lookup error:', projectError);
        throw new Error(`Project '${project}' not found`);
      }
      
      if (!projectData) {
        throw new Error(`Project '${project}' not found`);
      }

      // STEG 2: Hämta alla tasks för detta projekt
      const { data: tasks, error: tasksError } = await supabase
        .from('Task')
        .select('title')
        .eq('projectId', projectData.id);
        
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
              ? `Project "${projectData.title}" (ID: ${projectData.id}) has ${taskTitles.length} tasks: ${taskTitles.join(', ')}`
              : `Project "${projectData.title}" (ID: ${projectData.id}) has no tasks`
          },
        ],
      };
    } catch (error) {
      console.error('Error in Get_Task_By_ProjectID:', error);
      throw error;
    }
  }
);

// Register tool: Create Task
server.tool(
  'Create_Task',
  'Creates a new task for a customer and project. If projektNamn or kundNamn are not provided, they will be taken from the current context (selected customer/project). Parameters: { taskTitel: string, projektNamn?: string, kundNamn?: string, content?: string, priority?: string, status?: string }',
  { 
    taskTitel: z.string(),
    projektNamn: z.string().optional(),
    kundNamn: z.string().optional(),
    content: z.string().optional(),
    priority: z.string().optional(),
    status: z.string().optional()
  },
  async ({ taskTitel, projektNamn, kundNamn, content, priority, status }: { 
    taskTitel: string;
    projektNamn?: string;
    kundNamn?: string;
    content?: string;
    priority?: string;
    status?: string;
  }) => {
    if (!supabase) {
      throw new Error('Database not available. Please configure Supabase environment variables.');
    }
    
    // Kontrollera att vi har nödvändiga värden
    if (!kundNamn) {
      throw new Error('Kund namn krävs. Specificera kundNamn eller se till att en kund är vald i workspace.');
    }
    
    if (!projektNamn) {
      throw new Error('Projekt namn krävs. Specificera projektNamn eller se till att ett projekt är valt i workspace.');
    }
    
    try {
      // STEG 1: Hitta customer ID baserat på customer name
      const { data: customerData, error: customerError } = await supabase
        .from('Customer')
        .select('id, name')
        .eq('name', kundNamn)
        .single();
        
      if (customerError) {
        console.error('Customer lookup error:', customerError);
        throw new Error(`Customer '${kundNamn}' not found`);
      }
      
      if (!customerData) {
        throw new Error(`Customer '${kundNamn}' not found`);
      }

      // STEG 2: Hitta project ID baserat på project name och customer
      const { data: projectData, error: projectError } = await supabase
        .from('Project')
        .select('id, title')
        .eq('title', projektNamn)
        .eq('customerId', customerData.id)
        .single();
        
      if (projectError) {
        console.error('Project lookup error:', projectError);
        throw new Error(`Project '${projektNamn}' not found for customer '${kundNamn}'`);
      }
      
      if (!projectData) {
        throw new Error(`Project '${projektNamn}' not found for customer '${kundNamn}'`);
      }

      // STEG 3: Sätt default-värden
      const taskContent = content || taskTitel; // Om inget content angivet, använd titel
      const taskPriority = priority || 'LOW'; // Default priority
      const taskStatus = status || 'NOT_STARTED'; // Default status
      
      // STEG 4: Skapa task
      const now = new Date().toISOString();
      const { data: newTask, error: createError } = await supabase
        .from('Task')
        .insert([
          {
            title: taskTitel,
            content: taskContent,
            priority: taskPriority,
            status: taskStatus,
            customerId: customerData.id,
            projectId: projectData.id,
            parentId: null,
            createdAt: now,
            updatedAt: now,
            closedAt: null,
          },
        ])
        .select()
        .single();
        
      if (createError) {
        console.error('Task creation error:', createError);
        throw new Error('Failed to create task');
      }
      
      return {
        content: [
          { 
            type: 'text', 
            text: `✅ Task created successfully!
Title: "${taskTitel}"
Content: "${taskContent}"
Priority: ${taskPriority}
Status: ${taskStatus}
Customer: ${customerData.name} (ID: ${customerData.id})
Project: ${projectData.title} (ID: ${projectData.id})
Task ID: ${newTask.id}`
          },
        ],
      };
    } catch (error) {
      console.error('Error in Create_Task:', error);
      throw error;
    }
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