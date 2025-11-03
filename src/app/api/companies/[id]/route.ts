// Companies API Route - Individual Company Operations
// Handles GET, PUT, DELETE for a specific company

import { NextRequest, NextResponse } from 'next/server';
import { loadCompanies, saveCompanies } from '@/shared/domain/utils/companies-storage.util';

/**
 * GET - Get a specific company by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companies = loadCompanies();
    const company = companies.find((c: any) => c.id === id);

    if (!company) {
      return NextResponse.json(
        { success: false, error: `Company with ID "${id}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Error loading company:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load company' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a company
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    
    const companies = loadCompanies();
    const companyIndex = companies.findIndex((c: any) => c.id === id);

    if (companyIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Company with ID "${id}" not found` },
        { status: 404 }
      );
    }

    // Update company with new data, preserve id and createdAt
    const updatedCompany = {
      ...companies[companyIndex],
      ...updateData,
      id, // Ensure ID doesn't change
      createdAt: companies[companyIndex].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    companies[companyIndex] = updatedCompany;
    saveCompanies(companies);

    return NextResponse.json({
      success: true,
      data: updatedCompany,
      message: `Company "${updatedCompany.name}" updated successfully`
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update company' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a company
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companies = loadCompanies();
    const companyIndex = companies.findIndex((c: any) => c.id === id);

    if (companyIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Company with ID "${id}" not found` },
        { status: 404 }
      );
    }

    const deletedCompany = companies[companyIndex];
    companies.splice(companyIndex, 1);
    saveCompanies(companies);

    return NextResponse.json({
      success: true,
      data: deletedCompany,
      message: `Company "${deletedCompany.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete company' 
      },
      { status: 500 }
    );
  }
}

