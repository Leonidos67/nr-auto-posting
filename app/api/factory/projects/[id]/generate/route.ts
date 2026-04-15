import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import ContentProject from '@/models/ContentProject';
import StyleReference from '@/models/StyleReference';
import { getAIService } from '@/lib/ai-services';

// POST /api/factory/projects/[id]/generate
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
    const { topic, count = 1 } = body;

    // Обновляем статус проекта
    project.status = 'generating';
    await project.save();

    // Определяем какой AI сервис использовать
    const aiProvider = process.env.OPENAI_API_KEY ? 'openai' : 'openrouter';
    const aiService = getAIService(aiProvider);

    console.log(`Генерация контента для проекта: ${resolvedParams.id}`);
    console.log(`Тема: ${topic || 'не указана'}`);
    console.log(`Количество: ${count}`);

    // Генерируем контент
    const generatedContents = [];
    
    for (let i = 0; i < count; i++) {
      const content = await aiService.generateContent(project.styleProfile, topic);
      generatedContents.push(content);
    }

    // Обновляем проект
    project.contentCount += count;
    project.status = 'ready';
    await project.save();

    return NextResponse.json({
      message: 'Контент успешно сгенерирован',
      contents: generatedContents,
      project: {
        id: project._id,
        status: project.status,
        contentCount: project.contentCount,
      }
    });
  } catch (error: any) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/factory/projects/[id]/generate - получить информацию о генерации
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

    const project = await ContentProject.findOne({
      _id: resolvedParams.id,
      userId: payload.userId,
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      project: {
        id: project._id,
        status: project.status,
        styleProfile: project.styleProfile,
        contentCount: project.contentCount,
      }
    });
  } catch (error: any) {
    console.error('Error getting project:', error);
    return NextResponse.json(
      { error: 'Failed to get project', details: error.message },
      { status: 500 }
    );
  }
}
