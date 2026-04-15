# auto-posting

SaaS-платформа для автоматизации создания и публикации видеоконтента в социальных сетях с помощью ИИ.

## Функционал

- **Анализ стиля**: Загрузите изображения, и AI **реально проанализирует их** с помощью Vision API (GPT-4o)
  - Извлекает доминирующие цвета напрямую из изображений
  - Определяет настроение, темп, визуальный стиль
  - Распознает объекты и сцены
- **Генерация контента**: AI создаст сценарии, описания и промпты для видео на основе реального стиля
- **Автоматическая публикация**: Публикация на YouTube, TikTok, Instagram, VK, Telegram, Pinterest
- **Мульти-платформенность**: Поддержка OpenRouter, OpenAI и Stability AI

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_wBP8rrnJsodHena2cUW7gxPwxNOD)

## Getting Started

### 1. Настройка API ключей

Создайте файл `.env.local` и добавьте API ключи:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STABILITY_API_KEY=your_stability_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Подробная инструкция: [SETUP_AI.md](SETUP_AI.md)

### 2. Запуск

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## AI Интеграции

### OpenRouter
- Модель: meta-llama/llama-3.1-70b-instruct
- Использование: анализ стиля, генерация контента
- Docs: https://openrouter.ai/docs

### OpenAI
- Модели: gpt-4o (текст), dall-e-3 (изображения)
- Использование: анализ стиля, генерация контента, создание изображений
- Docs: https://platform.openai.com/docs

### Stability AI
- Модель: SDXL
- Использование: генерация изображений
- Docs: https://platform.stability.ai/docs

## Поддерживаемые платформы

- YouTube Shorts
- TikTok
- Instagram Reels
- Pinterest
- Telegram
- VK

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/Leonidos67/n8n-auto-posting" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>

