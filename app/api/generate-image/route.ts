import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Получаем данные из запроса
    const body = await request.json();
    const { 
      prompt, 
      aspect_ratio = '1:1',
      output_format = 'png',
      style_preset,
      negative_prompt,
      model = 'core' // 'core' или 'ultra'
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Определяем endpoint в зависимости от модели
    const endpoint = model === 'ultra' 
      ? 'https://api.stability.ai/v2beta/stable-image/generate/ultra'
      : 'https://api.stability.ai/v2beta/stable-image/generate/core';

    // Создаем FormData для запроса
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('aspect_ratio', aspect_ratio);
    formData.append('output_format', output_format);
    
    if (style_preset) {
      formData.append('style_preset', style_preset);
    }
    
    if (negative_prompt) {
      formData.append('negative_prompt', negative_prompt);
    }

    // Отправляем запрос к Stability AI
    const response = await axios.post(
      endpoint,
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

    if (response.status === 200) {
      // Конвертируем изображение в base64
      const base64Image = Buffer.from(response.data).toString('base64');
      const mimeType = output_format === 'jpeg' ? 'image/jpeg' : 
                       output_format === 'webp' ? 'image/webp' : 'image/png';
      const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

      return NextResponse.json({ 
        success: true, 
        image: imageDataUrl 
      });
    } else {
      const errorText = Buffer.from(response.data).toString('utf-8');
      console.error('Stability AI error:', response.status, errorText);
      
      return NextResponse.json(
        { error: `Generation failed: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image', details: error.message },
      { status: 500 }
    );
  }
}
