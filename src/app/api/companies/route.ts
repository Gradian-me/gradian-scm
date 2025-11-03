// Companies API Route
// Handles CRUD operations for companies

import { NextRequest, NextResponse } from 'next/server';
import { ulid } from 'ulid';
import { loadCompanies, saveCompanies } from '@/shared/domain/utils/companies-storage.util';

/**
 * GET - Get all companies
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('id');

    // Load companies (with caching)
    const companies = loadCompanies();
    
    // If specific company ID requested, return only that company
    if (companyId) {
      const company = companies.find((c: any) => c.id === companyId);
      
      if (!company) {
        return NextResponse.json(
          { success: false, error: `Company with ID "${companyId}" not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: company
      });
    }

    // Return all companies with no-cache headers
    return NextResponse.json({
      success: true,
      data: companies
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error loading companies:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load companies' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new company
 */
export async function POST(request: NextRequest) {
  try {
    const companyData = await request.json();

    // Load companies
    const companies = loadCompanies();
    
    // Generate ID if not provided
    if (!companyData.id) {
      companyData.id = ulid();
    }

    // Check if company with same ID already exists
    const existingCompany = companies.find((c: any) => c.id === companyData.id);
    
    if (existingCompany) {
      return NextResponse.json(
        { success: false, error: `Company with ID "${companyData.id}" already exists` },
        { status: 409 }
      );
    }

    // Add timestamps
    const now = new Date().toISOString();
    const newCompany = {
      ...companyData,
      id: companyData.id,
      createdAt: now,
      updatedAt: now,
    };

    // Add the new company
    companies.push(newCompany);

    // Save to file
    saveCompanies(companies);

    return NextResponse.json({
      success: true,
      data: newCompany,
      message: `Company "${newCompany.name}" created successfully`
    }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create company' 
      },
      { status: 500 }
    );
  }
}

