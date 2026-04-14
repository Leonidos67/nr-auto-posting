import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import StyleReference from '@/models/StyleReference';
import ContentProject from '@/models/ContentProject';

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

    if (references.length < 10) {
      return NextResponse.json(
        { error: 'Минимум 10 референсов требуется для анализа' },
        { status: 400 }
      );
    }

    // Имитация AI анализа (в реальном проекте здесь будет вызов AI API)
    console.log('Анализ стиля для проекта:', resolvedParams.id);
    console.log('Количество референсов:', references.length);

    // Анализируем каждый референс
    for (const ref of references) {
      ref.analysisStatus = 'analyzing';
      await ref.save();

      // Имитация анализа
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Генерируем случайный профиль стиля
      const moodOptions = ['dynamic', 'calm', 'energetic', 'professional', 'creative', 'modern'];
      const tempoOptions: Array<'slow' | 'medium' | 'fast'> = ['slow', 'medium', 'fast'];
      const colorPalettes = [
        ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
        ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
      ];

      ref.analysisStatus = 'completed';
      ref.analysisResult = {
        dominantColors: colorPalettes[Math.floor(Math.random() * colorPalettes.length)],
        mood: moodOptions[Math.floor(Math.random() * moodOptions.length)],
        tempo: tempoOptions[Math.floor(Math.random() * tempoOptions.length)],
        visualStyle: 'modern',
        objects: ['product', 'lifestyle', 'nature'],
        scene: 'urban',
      };

      await ref.save();
    }

    // Создаем общий профиль стиля для проекта
    const allColors = references
      .filter(r => r.analysisResult?.dominantColors)
      .flatMap(r => r.analysisResult!.dominantColors);
    
    const uniqueColors = [...new Set(allColors)].slice(0, 6);
    const mostCommonMood = references
      .filter(r => r.analysisResult?.mood)
      .map(r => r.analysisResult!.mood)
      .reduce((a, b, i, arr) => {
        return arr.filter(v => v === a).length > arr.filter(v => v === b).length ? a : b;
      }, '');

    const project = await ContentProject.findByIdAndUpdate(
      resolvedParams.id,
      {
        status: 'analyzing',
        styleProfile: {
          colors: uniqueColors,
          mood: mostCommonMood || 'modern',
          tempo: 'medium',
          musicStyle: 'upbeat',
          visualStyle: 'contemporary',
        },
      },
      { new: true }
    );

    return NextResponse.json({
      message: 'Анализ завершен',
      styleProfile: project?.styleProfile,
    });
  } catch (error: any) {
    console.error('Error analyzing references:', error);
    return NextResponse.json(
      { error: 'Failed to analyze references', details: error.message },
      { status: 500 }
    );
  }
}
