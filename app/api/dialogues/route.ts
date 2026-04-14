import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import Dialogue from '@/models/Dialogue';
import axios from 'axios';
import FormData from 'form-data';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/dialogues - Starting');
    
    const token = request.cookies.get('auth-token')?.value;
    console.log('Token exists:', !!token);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    console.log('Payload:', payload);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectMongoDB();
    console.log('MongoDB connected');

    // Получаем все диалоги пользователя, отсортированные по дате
    const dialogues = await Dialogue.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .select('_id modelVersion messages createdAt updatedAt');
    
    console.log('Found dialogues:', dialogues.length);

    // Форматируем ответ - берем первый промт пользователя как название чата
    const formattedDialogues = dialogues.map(dialogue => {
      const firstUserMessage = dialogue.messages?.find((m: any) => m.role === 'user');
      return {
        id: dialogue._id.toString(),
        title: firstUserMessage?.prompt || 'Без названия',
        modelVersion: dialogue.modelVersion,
        createdAt: dialogue.createdAt,
        updatedAt: dialogue.updatedAt,
        messageCount: dialogue.messages?.length || 0,
      };
    });
    
    console.log('Formatted dialogues:', formattedDialogues.length);

    return NextResponse.json({ dialogues: formattedDialogues });
  } catch (error: any) {
    console.error('Error fetching dialogues:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to fetch dialogues', details: error.message },
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

    const dialogue = new Dialogue({
      userId: payload.userId,
      modelVersion: modelVersion || 'image-2.0',
      messages: [
        userMessage,
        {
          role: 'assistant',
          imageUrl: imageUrl || '',
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
