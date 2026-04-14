import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import ContentProject from '@/models/ContentProject';

// POST /api/factory/projects/[id]/publish
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

    const project = await ContentProject.findOne({
      _id: resolvedParams.id,
      userId: payload.userId,
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.status !== 'ready') {
      return NextResponse.json(
        { error: 'Контент еще не готов к публикации' },
        { status: 400 }
      );
    }

    // Получаем данные для отправки на n8n
    const body = await request.json();
    const { contentUrl, description, platforms, scheduledTime } = body;

    // Подготовка payload для n8n webhook
    const n8nPayload = {
      projectId: project._id,
      userId: payload.userId,
      contentUrl,
      description: description || project.description,
      platforms: platforms || project.settings.targetPlatforms,
      styleProfile: project.styleProfile,
      metadata: {
        aspectRatio: project.settings.aspectRatio,
        duration: project.settings.videoDuration,
      },
      scheduledTime: scheduledTime || null,
      timestamp: new Date().toISOString(),
    };

    // Отправка на n8n webhook если URL настроен
    if (project.n8nWebhookUrl) {
      try {
        const response = await fetch(project.n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(n8nPayload),
        });

        if (!response.ok) {
          console.error('n8n webhook error:', await response.text());
          throw new Error('Failed to send to n8n webhook');
        }

        // Обновляем статус проекта
        project.status = 'posted';
        await project.save();

        return NextResponse.json({
          message: 'Контент отправлен на публикацию',
          sentTo: project.n8nWebhookUrl,
          platforms: platforms || project.settings.targetPlatforms,
        });
      } catch (webhookError: any) {
        console.error('Webhook error:', webhookError);
        return NextResponse.json(
          { error: 'Ошибка отправки на n8n webhook', details: webhookError.message },
          { status: 500 }
        );
      }
    }

    // Если webhook не настроен, просто обновляем статус
    project.status = 'posted';
    await project.save();

    return NextResponse.json({
      message: 'Статус обновлен. Настройте n8n webhook для автоматического постинга.',
      project,
    });
  } catch (error: any) {
    console.error('Error publishing content:', error);
    return NextResponse.json(
      { error: 'Failed to publish content', details: error.message },
      { status: 500 }
    );
  }
}
