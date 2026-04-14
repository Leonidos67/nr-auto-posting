import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import Dialogue from '@/models/Dialogue';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const resolvedParams = await params;

    await connectMongoDB();

    const dialogue = await Dialogue.findById(resolvedParams.id);
    
    if (!dialogue) {
      return NextResponse.json({ error: 'Dialogue not found' }, { status: 404 });
    }

    // Check if user owns this dialogue
    if (dialogue.userId.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ dialogue }, { status: 200 });
  } catch (error) {
    console.error('Error fetching dialogue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dialogue' },
      { status: 500 }
    );
  }
}
