import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import Dialogue from '@/models/Dialogue';
import axios from 'axios';
import FormData from 'form-data';

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

    // Генерируем изображение через Stability AI
    let imageUrl = '';
    
    // Проверяем режим теста
    if (process.env.TEST_MODE === 'true') {
      // Тестовый режим - используем placeholder изображение
      console.log('TEST MODE: Skipping real image generation');
      // Имитируем задержку генерации
      await new Promise(resolve => setTimeout(resolve, 3000));
      imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    } else {
      // Реальный режим - вызываем Stability AI
      try {
        const aspectRatio = settings?.aspectRatio || '1:1';
        const outputFormat = 'png';
        
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('aspect_ratio', aspectRatio);
        formData.append('output_format', outputFormat);

        const stabilityResponse = await axios.post(
          'https://api.stability.ai/v2beta/stable-image/generate/core',
          formData,
          {
            validateStatus: undefined,
            responseType: 'arraybuffer',
            headers: {
              Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
              Accept: 'image/*',
              ...formData.getHeaders(),
            },
          }
        );

        if (stabilityResponse.status === 200) {
          const base64Image = Buffer.from(stabilityResponse.data).toString('base64');
          imageUrl = `data:image/png;base64,${base64Image}`;
        }
      } catch (error) {
        console.error('Error generating image with Stability AI:', error);
      }
    }

    const assistantMessage = {
      role: 'assistant' as const,
      imageUrl: imageUrl || '',
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
