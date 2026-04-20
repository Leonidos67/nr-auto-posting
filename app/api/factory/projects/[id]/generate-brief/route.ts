import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import ContentProject from '@/models/ContentProject';
import { OpenAIService } from '@/lib/ai-services';

// POST /api/factory/projects/[id]/generate-brief
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

    await connectMongoDB();

    // Проверяем проект
    const project = await ContentProject.findOne({
      _id: resolvedParams.id,
      userId: payload.userId,
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Проверяем что стиль уже проанализирован
    if (!project.styleProfile || !project.styleProfile.mood) {
      return NextResponse.json(
        { error: 'Сначала проанализируйте стиль референсов' },
        { status: 400 }
      );
    }

    // Получаем данные из запроса
    const body = await request.json();
    const { topic, details, structure } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: 'Укажите тему для генерации' },
        { status: 400 }
      );
    }

    console.log(`Generating intelligent brief for project: ${resolvedParams.id}`);
    console.log(`Topic: ${topic}`);
    console.log(`Details: ${details || 'none'}`);
    console.log(`Custom structure: ${structure ? JSON.stringify(structure) : 'default'}`);

    // Используем OpenAI для генерации ТЗ
    const openAIService = new OpenAIService();

    const brief = await openAIService.generateBrief(
      topic,
      details || '',
      project.styleProfile,
      project.settings,
      structure // Передаем кастомную структуру
    );

    return NextResponse.json({
      message: 'ТЗ успешно сгенерировано',
      brief: brief,
    });
  } catch (error: any) {
    console.error('Error generating brief:', error);
    return NextResponse.json(
      { error: 'Failed to generate brief', details: error.message },
      { status: 500 }
    );
  }
}
