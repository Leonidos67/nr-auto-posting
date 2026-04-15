import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import StyleReference from '@/models/StyleReference';

// GET /api/factory/projects/[id]/references
export async function GET(
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

    const references = await StyleReference.find({
      projectId: resolvedParams.id,
      userId: payload.userId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ references });
  } catch (error: any) {
    console.error('Error fetching references:', error);
    return NextResponse.json(
      { error: 'Failed to fetch references', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/factory/projects/[id]/references
export async function POST(
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

    const body = await request.json();
    const { fileName, fileType, fileSize, fileUrl } = body;

    if (!fileName || !fileType || !fileSize || !fileUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!['video', 'image', 'audio'].includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be video, image, or audio' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const reference = new StyleReference({
      projectId: resolvedParams.id,
      userId: payload.userId,
      fileName,
      fileType,
      fileSize,
      fileUrl,
      analysisStatus: 'pending',
    });

    await reference.save();

    // Обновляем счетчик референсов в проекте
    const ContentProject = (await import('@/models/ContentProject')).default;
    await ContentProject.findByIdAndUpdate(resolvedParams.id, {
      $inc: { referenceCount: 1 },
    });

    return NextResponse.json(
      { reference, message: 'Reference uploaded successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error uploading reference:', error);
    return NextResponse.json(
      { error: 'Failed to upload reference', details: error.message },
      { status: 500 }
    );
  }
}
