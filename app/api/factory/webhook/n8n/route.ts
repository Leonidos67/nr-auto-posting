import { NextRequest, NextResponse } from 'next/server';

// POST /api/factory/webhook/n8n (для получения статуса от n8n)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, status, platform, postId, error } = body;

    // Это endpoint который n8n будет вызывать для отправки статуса
    console.log('n8n callback received:', body);

    // Здесь можно обновить статус публикации в базе
    // Например, записать ID поста на площадке

    return NextResponse.json({ message: 'Callback received' });
  } catch (error: any) {
    console.error('Error handling n8n callback:', error);
    return NextResponse.json(
      { error: 'Failed to handle callback', details: error.message },
      { status: 500 }
    );
  }
}
