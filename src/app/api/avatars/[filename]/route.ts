import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // For now, return a placeholder avatar or redirect to a default avatar service
    // In a real application, you would serve the actual avatar files from storage
    
    // Option 1: Redirect to a placeholder service
    return NextResponse.redirect('https://ui-avatars.com/api/?name=Mahyar+Abidi&background=3b82f6&color=ffffff&size=128');
    
    // Option 2: Return a default avatar (uncomment if you prefer this approach)
    // return NextResponse.json({ 
    //   success: false, 
    //   message: 'Avatar not found',
    //   placeholder: 'https://ui-avatars.com/api/?name=Mahyar+Abidi&background=3b82f6&color=ffffff&size=128'
    // }, { status: 404 });
    
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.redirect('https://ui-avatars.com/api/?name=User&background=6b7280&color=ffffff&size=128');
  }
}
