import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const DATA_FILE = join(process.cwd(), 'data', 'all-builders.json');

/**
 * GET - Get a single builder by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const fileContent = await readFile(DATA_FILE, 'utf-8');
    const builders = JSON.parse(fileContent);
    
    const builder = builders.find((b: any) => b.id === id);
    
    if (!builder) {
      return NextResponse.json(
        {
          success: false,
          error: `Builder with id "${id}" not found`
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: builder
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch builder'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a builder by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const fileContent = await readFile(DATA_FILE, 'utf-8');
    const builders = JSON.parse(fileContent);
    
    const index = builders.findIndex((b: any) => b.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: `Builder with id "${id}" not found`
        },
        { status: 404 }
      );
    }
    
    // Update builder
    builders[index] = {
      ...builders[index],
      ...body,
      id: builders[index].id // Prevent id change
    };
    
    // Write back to file
    await writeFile(DATA_FILE, JSON.stringify(builders, null, 2), 'utf-8');
    
    return NextResponse.json({
      success: true,
      data: builders[index]
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update builder'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a builder by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const fileContent = await readFile(DATA_FILE, 'utf-8');
    const builders = JSON.parse(fileContent);
    
    const index = builders.findIndex((b: any) => b.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: `Builder with id "${id}" not found`
        },
        { status: 404 }
      );
    }
    
    // Remove builder
    const deletedBuilder = builders.splice(index, 1)[0];
    
    // Write back to file
    await writeFile(DATA_FILE, JSON.stringify(builders, null, 2), 'utf-8');
    
    return NextResponse.json({
      success: true,
      data: deletedBuilder
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete builder'
      },
      { status: 500 }
    );
  }
}

