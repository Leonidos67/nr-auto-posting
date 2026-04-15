import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import StyleReference from '@/models/StyleReference';
import ContentProject from '@/models/ContentProject';

// DELETE /api/factory/projects/[id]/references/[refId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; refId: string }> }
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

    const reference = await StyleReference.findOneAndDelete({
      _id: resolvedParams.refId,
      projectId: resolvedParams.id,
      userId: payload.userId,
    });

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference not found' },
        { status: 404 }
      );
    }

    // Обновляем счетчик референсов в проекте
    await ContentProject.findByIdAndUpdate(resolvedParams.id, {
      $inc: { referenceCount: -1 },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Reference deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting reference:', error);
    return NextResponse.json(
      { error: 'Failed to delete reference', details: error.message },
      { status: 500 }
    );
  }
}
