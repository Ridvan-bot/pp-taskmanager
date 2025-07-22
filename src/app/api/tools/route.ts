import { NextRequest, NextResponse } from 'next/server';
import { callToolsViaMcp, getToolsviaMcp } from '@/utils/mcp/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { funcArguments, name } = body;
    const { functions: dbFunctions } = await getToolsviaMcp();
    console.log(dbFunctions);
    if (dbFunctions.some((tool) => tool.name === name)) {
      const result = await callToolsViaMcp(name, funcArguments);
      console.log('Resultattatatatat ',result);
      return NextResponse.json({ text: result });
    } else {
      return NextResponse.json(
        { error: `Tool ${name} not found.` },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error(
      'Error calling OpenAI API (POST):',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return NextResponse.json(
      { error: 'An error occurred, please try again later.' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    console.log('🔍 Fetching MCP tools via API...');
    const { functions } = await getToolsviaMcp();
    console.log('✅ Available MCP tools:', functions.map((f: { name: string }) => f.name));
    
    return NextResponse.json({ 
      tools: { 
        functions 
      },
      message: 'Tools fetched successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching MCP tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools', details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}