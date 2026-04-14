import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import Dialogue from '@/models/Dialogue';

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
    const { modelVersion, prompt, imageReferences, settings } = body;

    await connectMongoDB();

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

    const dialogue = new Dialogue({
      userId: payload.userId,
      modelVersion: modelVersion || 'image-2.0',
      messages: [
        userMessage,
        {
          role: 'assistant',
          // prompt: `Генерация изображения: "${prompt}"`,
          settings: userMessage.settings,
        },
      ],
    });

    await dialogue.save();

    return NextResponse.json(
      {
        dialogueId: dialogue._id,
        message: 'Dialogue created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating dialogue:', error);
    return NextResponse.json(
      { error: 'Failed to create dialogue' },
      { status: 500 }
    );
  }
}
