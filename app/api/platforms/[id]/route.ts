import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import PlatformConnection from '@/models/PlatformConnection';

// DELETE /api/platforms/[id] - Disconnect a platform
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectMongoDB();

    const connection = await PlatformConnection.findOneAndDelete({
      _id: resolvedParams.id,
      userId: payload.userId,
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Platform connection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Platform disconnected successfully' 
    });
  } catch (error: any) {
    console.error('Error disconnecting platform:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect platform', details: error.message },
      { status: 500 }
    );
  }
}
