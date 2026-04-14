import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import ContentProject from '@/models/ContentProject';

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

    const projects = await ContentProject.find({ userId: payload.userId })
      .sort({ createdAt: -1 });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error.message },
      { status: 500 }
    );
  }
}

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
    const { name, description, platforms, settings } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const project = new ContentProject({
      userId: payload.userId,
      name,
      description: description || '',
      platforms: platforms || [],
      settings: settings || {
        videoDuration: 60,
        aspectRatio: '9:16',
        targetPlatforms: platforms || [],
      },
    });

    await project.save();

    return NextResponse.json(
      { 
        project,
        message: 'Project created successfully' 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: error.message },
      { status: 500 }
    );
  }
}
