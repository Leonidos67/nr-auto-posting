import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import StyleReference from '@/models/StyleReference';
import ContentProject from '@/models/ContentProject';
import { getAIService } from '@/lib/ai-services';

// POST /api/factory/projects/[id]/analyze
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

    // Получаем все референсы проекта
    const references = await StyleReference.find({
      projectId: resolvedParams.id,
      userId: payload.userId,
    });

    if (references.length === 0) {
      return NextResponse.json(
        { error: 'Загрузите хотя бы один референс для анализа' },
        { status: 400 }
      );
    }

    // Обновляем статус проекта
    const project = await ContentProject.findByIdAndUpdate(
      resolvedParams.id,
      { status: 'analyzing' },
      { new: true }
    );

    // Определяем какой AI сервис использовать
    // ПРИОРИТЕТ: OpenRouter (работает в РФ), потом OpenAI
    const aiProvider = process.env.OPENROUTER_API_KEY ? 'openrouter' : 'openai';
    const aiService = getAIService(aiProvider);

    console.log(`Анализ стиля для проекта: ${resolvedParams.id}`);
    console.log(`Количество референсов: ${references.length}`);
    console.log(`Используемый AI провайдер: ${aiProvider}`);
    console.log(`API ключ есть: ${aiProvider === 'openrouter' ? process.env.OPENROUTER_API_KEY?.substring(0, 10) + '...' : process.env.OPENAI_API_KEY?.substring(0, 10) + '...'}`);
    
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Не настроен API ключ! Добавьте OPENROUTER_API_KEY в .env.local' },
        { status: 500 }
      );
    }

    // Подготавливаем данные референсов для AI анализа
    const referencesData = references.map(ref => ({
      fileUrl: ref.fileUrl,
      fileName: ref.fileName,
      fileType: ref.fileType
    }));

    console.log('References data prepared:', referencesData.length, 'files');
    console.log('First reference fileUrl starts with:', referencesData[0]?.fileUrl?.substring(0, 50));

    // Анализируем стиль с помощью AI
    console.log('Calling AI service...');
    let styleAnalysis;
    try {
      styleAnalysis = await aiService.analyzeStyle(referencesData);
    } catch (aiError: any) {
      console.error('AI analysis failed:', aiError.message);
      return NextResponse.json(
        { 
          error: 'AI анализ не удался. Убедитесь что:\n1. API ключ настроен в .env.local\n2. Загружены изображения (не видео/audio)\n3. Изображения в формате base64 или URL',
          details: aiError.message 
        },
        { status: 500 }
      );
    }
    console.log('AI Analysis result:', JSON.stringify(styleAnalysis, null, 2));

    // Обновляем каждый референс с результатами анализа
    for (const ref of references) {
      ref.analysisStatus = 'completed';
      ref.analysisResult = {
        dominantColors: styleAnalysis.dominantColors,
        mood: styleAnalysis.mood,
        tempo: styleAnalysis.tempo,
        visualStyle: styleAnalysis.visualStyle,
        objects: styleAnalysis.objects,
        scene: styleAnalysis.scene,
      };
      await ref.save();
    }

    // Обновляем профиль стиля проекта
    const updatedProject = await ContentProject.findByIdAndUpdate(
      resolvedParams.id,
      {
        status: 'ready',
        styleProfile: {
          colors: styleAnalysis.dominantColors,
          mood: styleAnalysis.mood,
          tempo: styleAnalysis.tempo,
          musicStyle: styleAnalysis.musicStyle,
          visualStyle: styleAnalysis.visualStyle,
        },
      },
      { new: true }
    );

    return NextResponse.json({
      message: 'Анализ завершен',
      styleProfile: updatedProject?.styleProfile,
    });
  } catch (error: any) {
    console.error('Error analyzing references:', error);
    return NextResponse.json(
      { error: 'Failed to analyze references', details: error.message },
      { status: 500 }
    );
  }
}
