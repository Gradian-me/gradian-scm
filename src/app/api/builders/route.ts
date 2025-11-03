import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const DATA_FILE = join(process.cwd(), 'data', 'all-builders.json');

/**
 * GET - Get all builders
 */
export async function GET(request: NextRequest) {
  try {
    const fileContent = await readFile(DATA_FILE, 'utf-8');
    const builders = JSON.parse(fileContent);
    
    // Support search parameter
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    
    let filteredBuilders = builders;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBuilders = builders.filter((builder: any) =>
        builder.title.toLowerCase().includes(searchLower) ||
        builder.description.toLowerCase().includes(searchLower) ||
        builder.id.toLowerCase().includes(searchLower)
      );
    }
    
    return NextResponse.json({
      success: true,
      data: filteredBuilders,
      count: filteredBuilders.length
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch builders'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new builder
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.id || !body.title || !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: id, title, description'
        },
        { status: 400 }
      );
    }
    
    const fileContent = await readFile(DATA_FILE, 'utf-8');
    const builders = JSON.parse(fileContent);
    
    // Check if builder with same id already exists
    if (builders.find((b: any) => b.id === body.id)) {
      return NextResponse.json(
        {
          success: false,
          error: `Builder with id "${body.id}" already exists`
        },
        { status: 409 }
      );
    }
    
    // Add new builder
    const newBuilder = {
      id: body.id,
      title: body.title,
      description: body.description,
      icon: body.icon || 'Settings',
      href: body.href || `/builder/${body.id}`,
      color: body.color || '#8B5CF6',
      features: body.features || [],
      stats: body.stats || []
    };
    
    builders.push(newBuilder);
    
    // Write back to file
    await writeFile(DATA_FILE, JSON.stringify(builders, null, 2), 'utf-8');
    
    return NextResponse.json({
      success: true,
      data: newBuilder
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create builder'
      },
      { status: 500 }
    );
  }
}

