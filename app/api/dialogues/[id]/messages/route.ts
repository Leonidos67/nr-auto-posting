import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import Dialogue from '@/models/Dialogue';

export async function POST(
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

    const body = await request.json();
    const { prompt, imageReferences, settings } = body;

    await connectMongoDB();

    const dialogue = await Dialogue.findById(resolvedParams.id);
    
    if (!dialogue) {
      return NextResponse.json({ error: 'Dialogue not found' }, { status: 404 });
    }

    // Check if user owns this dialogue
    if (dialogue.userId.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Add new user message
    const userMessage = {
      role: 'user',
      prompt,
      imageReferences: imageReferences || [],
      settings: settings || {
        mode: '1kSD',
        aspectRatio: '1:1',
        imageCount: 1,
      },
    };
    
    dialogue.messages.push(userMessage);

    // TODO: Integrate with real image generation API (OpenAI, Stability AI, etc.)
    // For now, AI responds with text confirmation. Image will be added when generation is implemented.
    const assistantMessage = {
      role: 'assistant' as const,
      // prompt: `Генерация изображения: "${prompt}"`,
      settings: userMessage.settings,
    };

    dialogue.messages.push(assistantMessage);

    await dialogue.save();

    return NextResponse.json(
      {
        message: 'Message added successfully',
        dialogueId: dialogue._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}
