import axios from 'axios';

// Интерфейсы для типов
export interface StyleAnalysisResult {
  dominantColors: string[];
  mood: string;
  tempo: 'slow' | 'medium' | 'fast';
  visualStyle: string;
  objects: string[];
  scene: string;
  musicStyle?: string;
}

export interface ContentGenerationResult {
  title: string;
  description: string;
  script: string;
  tags: string[];
  imageUrl?: string;
  videoPrompt?: string;
}

// Сервис для работы с OpenRouter API
export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY not configured');
    }
  }

  // Анализ стиля референсов с помощью AI с vision
  async analyzeStyle(references: Array<{ fileUrl: string; fileName: string; fileType: string }>): Promise<StyleAnalysisResult> {
    try {
      console.log('OpenRouter: Starting style analysis with', references.length, 'references');
      
      // Создаем сообщения с изображениями для vision анализа
      const contentMessages: any[] = [
        {
          type: 'text',
          text: `Ты профессиональный дизайнер и аналитик. Внимательно проанализируй ВСЕ приложенные изображения.

Верни ТОЛЬКО валидный JSON БЕЗ markdown и БЕЗ пояснений:
{
  "dominantColors": ["#123456", "#234567", "#345678", "#456789", "#567890", "#678901"],
  "mood": "dynamic",
  "tempo": "medium",
  "visualStyle": "minimalist",
  "objects": ["object1", "object2"],
  "scene": "urban",
  "musicStyle": "electronic"
}

ПРАВИЛА:
1. dominantColors: извлеки 5-6 реальных доминирующих цветов из изображений. Смотри на пиксели!
2. mood: выбери ОДНО - dynamic, calm, energetic, professional, creative, modern
3. tempo: выбери ОДНО - slow, medium, fast
4. visualStyle: опиши стиль (minimalist, vintage, modern, retro, futuristic, grunge и т.д.)
5. objects: перечисли основные объекты которые ВИДИШЬ на фото
6. scene: тип сцены (urban, nature, studio, indoor, outdoor, industrial)
7. musicStyle: какая музыка подойдет (upbeat, chill, electronic, acoustic, ambient)

ВАЖНО: Анализируй РЕАЛЬНОЕ содержимое изображений, не выдумывай!`        }
      ];

      // Добавляем изображения (если это image файлы)
      const imageRefs = references.filter(ref => ref.fileType === 'image');
      console.log('Image references to analyze:', imageRefs.length);
      
      for (const ref of imageRefs.slice(0, 10)) { // Максимум 10 изображений
        // Если fileUrl это base64
        if (ref.fileUrl.startsWith('data:image')) {
          console.log('Adding base64 image, length:', ref.fileUrl.length);
          contentMessages.push({
            type: 'image_url',
            image_url: {
              url: ref.fileUrl,
              detail: 'high'
            }
          });
        }
        // Если fileUrl это URL
        else if (ref.fileUrl.startsWith('http')) {
          console.log('Adding image URL:', ref.fileUrl);
          contentMessages.push({
            type: 'image_url',
            image_url: {
              url: ref.fileUrl,
              detail: 'high'
            }
          });
        }
      }

      if (imageRefs.length === 0) {
        console.error('NO IMAGE REFERENCES FOUND! Only file names will be used.');
      }

      console.log('Total content messages:', contentMessages.length);
      console.log('Using API key:', this.apiKey ? 'Present (length: ' + this.apiKey.length + ')' : 'Missing!');

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'openai/gpt-4o', // Используем модель с vision support
          messages: [
            {
              role: 'user',
              content: contentMessages
            }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'Video SaaS Platform'
          }
        }
      );

      console.log('OpenRouter API response status:', response.status);
      
      const rawContent = response.data.choices[0].message.content;
      console.log('Raw AI response:', rawContent);
      
      // Парсим JSON ответ
      let result;
      try {
        // Убираем markdown если есть
        const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        result = JSON.parse(cleaned);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        throw new Error('AI did not return valid JSON');
      }
      
      // ВАЛИДАЦИЯ - если AI вернул шаблонные цвета, выбрасываем ошибку
      const templateColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
      const isTemplateResult = JSON.stringify(result.dominantColors) === JSON.stringify(templateColors);
      
      if (isTemplateResult) {
        console.error('AI returned template colors! Real analysis failed.');
        throw new Error('AI did not analyze images properly');
      }
      
      console.log('✅ Real AI Analysis Result:', JSON.stringify(result, null, 2));
      
      return {
        dominantColors: result.dominantColors,
        mood: result.mood,
        tempo: result.tempo,
        visualStyle: result.visualStyle,
        objects: result.objects,
        scene: result.scene,
        musicStyle: result.musicStyle
      };
    } catch (error: any) {
      console.error('❌ Error analyzing style with OpenRouter:', error.message);
      if (error.response) {
        console.error('OpenRouter API error:', error.response.status, JSON.stringify(error.response.data));
      }
      // Перебрасываем ошибку дальше - НЕ возвращаем fallback
      throw error;
    }
  }

  // Генерация контента на основе профиля стиля
  async generateContent(styleProfile: any, topic?: string): Promise<ContentGenerationResult> {
    try {
      const prompt = `
        Создай контент для социального медиа на основе следующего стиля:
        - Настроение: ${styleProfile.mood}
        - Темп: ${styleProfile.tempo}
        - Визуальный стиль: ${styleProfile.visualStyle}
        - Цвета: ${styleProfile.colors?.join(', ')}
        - Объекты: ${styleProfile.objects?.join(', ')}
        ${topic ? `- Тема: ${topic}` : ''}
        
        Верни JSON с полями:
        - title: заголовок контента
        - description: описание
        - script: сценарий/текст для видео
        - tags: массив тегов (5-10 штук)
        - videoPrompt: промпт для генерации видео
      `;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'meta-llama/llama-3.1-70b-instruct',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'Video SaaS Platform'
          }
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return {
        title: result.title || 'Generated Content',
        description: result.description || '',
        script: result.script || '',
        tags: result.tags || ['content', 'social'],
        videoPrompt: result.videoPrompt || ''
      };
    } catch (error) {
      console.error('Error generating content with OpenRouter:', error);
      return {
        title: 'Generated Content',
        description: 'AI-generated content based on your style profile',
        script: '',
        tags: ['ai', 'generated', 'content'],
        videoPrompt: ''
      };
    }
  }

  // Генерация изображения через OpenRouter (модели с поддержкой изображений)
  async generateImage(prompt: string, aspectRatio: string = '1:1'): Promise<string> {
    try {
      // Используем модель с поддержкой генерации изображений
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'stability-ai/stable-diffusion-3-5-large',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'Video SaaS Platform'
          }
        }
      );

      // В реальном сценарии здесь нужно обработать ответ от модели генерации изображений
      // Для демонстрации возвращаем placeholder
      return `data:image/png;base64,placeholder`;
    } catch (error) {
      console.error('Error generating image with OpenRouter:', error);
      throw error;
    }
  }
}

// Сервис для работы с OpenAI API
export class OpenAIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OPENAI_API_KEY not configured');
    }
  }

  // Анализ стиля референсов с помощью OpenAI Vision
  async analyzeStyle(references: Array<{ fileUrl: string; fileName: string; fileType: string }>): Promise<StyleAnalysisResult> {
    try {
      console.log('OpenAI: Starting style analysis with', references.length, 'references');
      console.log('OpenAI API key present:', !!this.apiKey);
      
      // Создаем сообщения с изображениями для vision анализа
      const contentMessages: any[] = [
        {
          type: 'text',
          text: `Ты профессиональный дизайнер и аналитик. Внимательно проанализируй ВСЕ приложенные изображения.

Верни ТОЛЬКО валидный JSON БЕЗ markdown и БЕЗ пояснений:
{
  "dominantColors": ["#123456", "#234567", "#345678", "#456789", "#567890", "#678901"],
  "mood": "dynamic",
  "tempo": "medium",
  "visualStyle": "minimalist",
  "objects": ["object1", "object2"],
  "scene": "urban",
  "musicStyle": "electronic"
}

ПРАВИЛА:
1. dominantColors: извлеки 5-6 реальных доминирующих цветов из изображений. Смотри на пиксели!
2. mood: выбери ОДНО - dynamic, calm, energetic, professional, creative, modern
3. tempo: выбери ОДНО - slow, medium, fast
4. visualStyle: опиши стиль (minimalist, vintage, modern, retro, futuristic, grunge и т.д.)
5. objects: перечисли основные объекты которые ВИДИШЬ на фото
6. scene: тип сцены (urban, nature, studio, indoor, outdoor, industrial)
7. musicStyle: какая музыка подойдет (upbeat, chill, electronic, acoustic, ambient)

ВАЖНО: Анализируй РЕАЛЬНОЕ содержимое изображений, не выдумывай!`
        }
      ];

      // Добавляем изображения (если это image файлы)
      const imageRefs = references.filter(ref => ref.fileType === 'image');
      console.log('Image references to analyze:', imageRefs.length);
      
      for (const ref of imageRefs.slice(0, 10)) { // Максимум 10 изображений
        // Если fileUrl это base64
        if (ref.fileUrl.startsWith('data:image')) {
          console.log('Adding base64 image, length:', ref.fileUrl.length);
          contentMessages.push({
            type: 'image_url',
            image_url: {
              url: ref.fileUrl,
              detail: 'high'
            }
          });
        }
        // Если fileUrl это URL
        else if (ref.fileUrl.startsWith('http')) {
          console.log('Adding image URL:', ref.fileUrl);
          contentMessages.push({
            type: 'image_url',
            image_url: {
              url: ref.fileUrl,
              detail: 'high'
            }
          });
        }
      }

      if (imageRefs.length === 0) {
        console.error('NO IMAGE REFERENCES FOUND! Only file names will be used.');
      }

      console.log('Total content messages:', contentMessages.length);
      console.log('Using OpenAI API key:', this.apiKey ? 'Present (length: ' + this.apiKey.length + ')' : 'Missing!');

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4o', // Используем GPT-4o с vision support
          messages: [
            {
              role: 'user',
              content: contentMessages
            }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('OpenAI API response status:', response.status);
      
      const rawContent = response.data.choices[0].message.content;
      console.log('Raw AI response:', rawContent);
      
      // Парсим JSON ответ
      let result;
      try {
        // Убираем markdown если есть
        const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        result = JSON.parse(cleaned);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        throw new Error('AI did not return valid JSON');
      }
      
      // ВАЛИДАЦИЯ - если AI вернул шаблонные цвета, выбрасываем ошибку
      const templateColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
      const isTemplateResult = JSON.stringify(result.dominantColors) === JSON.stringify(templateColors);
      
      if (isTemplateResult) {
        console.error('AI returned template colors! Real analysis failed.');
        throw new Error('AI did not analyze images properly');
      }
      
      console.log('✅ OpenAI Real Analysis Result:', JSON.stringify(result, null, 2));
      
      return {
        dominantColors: result.dominantColors,
        mood: result.mood,
        tempo: result.tempo,
        visualStyle: result.visualStyle,
        objects: result.objects,
        scene: result.scene,
        musicStyle: result.musicStyle
      };
    } catch (error: any) {
      console.error('❌ Error analyzing style with OpenAI:', error.message);
      if (error.response) {
        console.error('OpenAI API error:', error.response.status, JSON.stringify(error.response.data));
      }
      // Перебрасываем ошибку дальше - НЕ возвращаем fallback
      throw error;
    }
  }

  // Генерация контента на основе профиля стиля
  async generateContent(styleProfile: any, topic?: string): Promise<ContentGenerationResult> {
    try {
      const prompt = `
        Создай контент для социального медиа на основе следующего стиля:
        - Настроение: ${styleProfile.mood}
        - Темп: ${styleProfile.tempo}
        - Визуальный стиль: ${styleProfile.visualStyle}
        - Цвета: ${styleProfile.colors?.join(', ')}
        - Объекты: ${styleProfile.objects?.join(', ')}
        ${topic ? `- Тема: ${topic}` : ''}
        
        Верни JSON с полями:
        - title: заголовок контента
        - description: описание
        - script: сценарий/текст для видео
        - tags: массив тегов (5-10 штук)
        - videoPrompt: промпт для генерации видео
      `;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return {
        title: result.title || 'Generated Content',
        description: result.description || '',
        script: result.script || '',
        tags: result.tags || ['content', 'social'],
        videoPrompt: result.videoPrompt || ''
      };
    } catch (error) {
      console.error('Error generating content with OpenAI:', error);
      return {
        title: 'Generated Content',
        description: 'AI-generated content based on your style profile',
        script: '',
        tags: ['ai', 'generated', 'content'],
        videoPrompt: ''
      };
    }
  }

  // Генерация изображения через DALL-E
  async generateImage(prompt: string, size: string = '1024x1024'): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        {
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: size
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data[0].url;
    } catch (error) {
      console.error('Error generating image with DALL-E:', error);
      throw error;
    }
  }
}

// Фабрика для получения нужного AI сервиса
export function getAIService(provider: 'openrouter' | 'openai' = 'openrouter') {
  if (provider === 'openai') {
    return new OpenAIService();
  }
  return new OpenRouterService();
}
