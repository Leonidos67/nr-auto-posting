import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import PlatformConnection from '@/models/PlatformConnection';

// GET /api/platforms - Get all connected platforms
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectMongoDB();

    const platforms = await PlatformConnection.find({
      userId: payload.userId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ platforms });
  } catch (error: any) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platforms', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/platforms - Connect a new platform
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { platform, ...credentials } = body;

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Check if platform is already connected
    const existing = await PlatformConnection.findOne({
      userId: payload.userId,
      platform,
      status: 'connected',
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Platform already connected' },
        { status: 400 }
      );
    }

    // Create new platform connection
    const connection = new PlatformConnection({
      userId: payload.userId,
      platform,
      accountName: credentials.accountName || credentials.channelId || credentials.groupId || platform,
      credentials: credentials,
      status: 'connected',
      postsCount: 0,
    });

    await connection.save();

    return NextResponse.json(
      { 
        connection,
        message: 'Platform connected successfully' 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error connecting platform:', error);
    return NextResponse.json(
      { error: 'Failed to connect platform', details: error.message },
      { status: 500 }
    );
  }
}
