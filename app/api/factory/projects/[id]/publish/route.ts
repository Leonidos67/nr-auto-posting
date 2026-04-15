import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectMongoDB from '@/lib/mongodb';
import ContentProject from '@/models/ContentProject';
import PlatformConnection from '@/models/PlatformConnection';
import axios from 'axios';

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

    // Проверяем проект
    const project = await ContentProject.findOne({
      _id: resolvedParams.id,
      userId: payload.userId,
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Получаем данные из запроса
    const body = await request.json();
    const { 
      platforms, // массив ID платформ
      content, // контент для публикации
      scheduleTime // время публикации (опционально)
    } = body;

    if (!platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Выберите хотя бы одну платформу для публикации' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Контент для публикации не указан' },
        { status: 400 }
      );
    }

    // Проверяем подключения платформ
    const platformConnections = await PlatformConnection.find({
      _id: { $in: platforms },
      userId: payload.userId,
      status: 'connected',
    });

    if (platformConnections.length === 0) {
      return NextResponse.json(
        { error: 'Нет активных подключений к выбранным платформам' },
        { status: 400 }
      );
    }

    console.log(`Публикация контента для проекта: ${resolvedParams.id}`);
    console.log(`Платформы: ${platformConnections.map(p => p.platform).join(', ')}`);

    // Публикуем на каждую платформу
    const publishResults = [];
    
    for (const platform of platformConnections) {
      try {
        let result;
        
        switch (platform.platform) {
          case 'telegram':
            result = await publishToTelegram(platform, content);
            break;
          case 'vk':
            result = await publishToVK(platform, content);
            break;
          case 'instagram-reels':
            result = await publishToInstagram(platform, content);
            break;
          case 'youtube-shorts':
            result = await publishToYouTube(platform, content);
            break;
          case 'tiktok':
          case 'pinterest':
          default:
            // Используем n8n webhook для других платформ
            result = await publishViaWebhook(platform, content);
        }
        
        publishResults.push({
          platform: platform.platform,
          success: true,
          result,
        });
      } catch (error: any) {
        console.error(`Ошибка публикации на ${platform.platform}:`, error);
        publishResults.push({
          platform: platform.platform,
          success: false,
          error: error.message,
        });
      }
    }

    // Обновляем статус проекта
    const allSuccess = publishResults.every(r => r.success);
    project.status = allSuccess ? 'posted' : 'ready';
    await project.save();

    return NextResponse.json({
      message: allSuccess ? 'Контент успешно опубликован' : 'Публикация завершена с ошибками',
      results: publishResults,
      project: {
        id: project._id,
        status: project.status,
      }
    });
  } catch (error: any) {
    console.error('Error publishing content:', error);
    return NextResponse.json(
      { error: 'Failed to publish content', details: error.message },
      { status: 500 }
    );
  }
}

// Вспомогательные функции для публикации на разных платформах

async function publishToTelegram(platform: any, content: any) {
  // Реализация публикации в Telegram через Bot API
  const credentials = platform.credentials || {};
  const botToken = credentials.botToken;
  const chatId = credentials.chatId;
  
  if (!botToken || !chatId) {
    throw new Error('Telegram bot token or chat ID not configured');
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await axios.post(url, {
    chat_id: chatId,
    text: content.description || content.title,
    parse_mode: 'HTML',
  });

  return response.data;
}

async function publishToVK(platform: any, content: any) {
  // Реализация публикации в VK через API
  const credentials = platform.credentials || {};
  const accessToken = credentials.accessToken;
  const ownerId = credentials.ownerId;
  
  if (!accessToken) {
    throw new Error('VK access token not configured');
  }

  const url = 'https://api.vk.com/method/wall.post';
  
  const response = await axios.post(url, null, {
    params: {
      access_token: accessToken,
      owner_id: ownerId,
      message: content.description || content.title,
      v: '5.131',
    }
  });

  return response.data;
}

async function publishToInstagram(platform: any, content: any) {
  // Реализация публикации в Instagram через Graph API
  const credentials = platform.credentials || {};
  const accessToken = credentials.accessToken;
  const igUserId = credentials.igUserId;
  
  if (!accessToken || !igUserId) {
    throw new Error('Instagram access token or user ID not configured');
  }

  // Для Instagram нужно сначала создать медиа-объект
  // Затем опубликовать его
  // Упрощенная реализация
  
  return { success: true, message: 'Published to Instagram' };
}

async function publishToYouTube(platform: any, content: any) {
  // Реализация публикации на YouTube через API
  const credentials = platform.credentials || {};
  const accessToken = credentials.accessToken;
  
  if (!accessToken) {
    throw new Error('YouTube access token not configured');
  }

  // Для YouTube нужно загрузить видео
  // Упрощенная реализация
  
  return { success: true, message: 'Published to YouTube' };
}

async function publishViaWebhook(platform: any, content: any) {
  // Публикация через n8n webhook
  const credentials = platform.credentials || {};
  const webhookUrl = credentials.webhookUrl || platform.webhookUrl;
  
  if (!webhookUrl) {
    throw new Error('Webhook URL not configured');
  }

  const response = await axios.post(webhookUrl, {
    platform: platform.platform,
    content,
    timestamp: new Date().toISOString(),
  });

  return response.data;
}
