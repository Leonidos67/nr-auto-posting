# Content Factory (AI-Студия) - AI Agent Documentation

## Overview

The Content Factory is a comprehensive content management and automation system for creating, managing, and publishing video/image content across multiple social media platforms. It uses AI to analyze style references, generate content, and automate publishing workflows.

**Location**: `/app/factory` (list) and `/app/factory/[id]` (project detail)

---

## Architecture

### Two-Level Structure

1. **Factory List Page** (`/app/factory`) - Dashboard showing all projects
2. **Project Detail Page** (`/app/factory/[id]`) - Individual project management with 18 tabs

---

## Factory List Page (`/app/factory`)

### Purpose
Central dashboard for managing all content projects with overview statistics and quick access to features.

### Tabs & Functionality

#### 1. **Обзор (Overview)** - Default Tab
- **Purpose**: Display all user's content projects
- **Features**:
  - Grid view of project cards
  - Project status badges (draft, generating, ready, posted)
  - Quick actions: Configure, Post
  - Create new project button
  - Connected platforms shortcut
- **Data Sources**:
  - `GET /api/factory/projects` - Fetch all projects
  - `GET /api/platforms` - Fetch connected platforms
- **Key Components**:
  - Project cards with name, description, reference count, content count
  - Status indicators with color coding
  - Navigation to project detail: `/app/factory/${project._id}`

#### 2. **Генерации (Generations)**
- **Purpose**: Show generation history across all projects
- **Features**:
  - Total generations count (aggregated from all projects)
  - Currently generating projects count
  - Ready projects count
  - List of projects with generation status
- **Data Displayed**:
  - Project name
  - Content count (videos)
  - Reference count
  - Status badges
  - Link to open project

#### 3. **Журналы (Logs)**
- **Purpose**: System-wide activity log
- **Features**:
  - Filter tabs: Все, Генерация, Загрузка, Публикация, Ошибки
  - Activity timeline with color-coded entries
  - Filter by category
- **Log Entry Structure**:
  ```typescript
  {
    time: string,           // "14:32"
    type: 'success' | 'info' | 'warning' | 'error',
    category: 'publish' | 'generation' | 'upload' | 'error',
    message: string,        // Action description
    project: string         // Project name
  }
  ```
- **Filtering Logic**: `.filter(log => logFilter === 'all' || log.category === logFilter)`

#### 4. **Аналитика (Analytics)**
- **Purpose**: Content performance analysis
- **Features**:
  - Total analyses count
  - Average quality score
  - References processed count
  - Style profiles created
  - Recent style analysis results with accuracy scores
  - Color palette visualization
- **Data Displayed**:
  - Project name
  - Analysis date
  - Accuracy percentage
  - Extracted color palettes

#### 5. **Скорость (Speed/Performance)**
- **Purpose**: Monitor generation performance metrics
- **Features**:
  - Average generation time (images: 1.2s, videos: 3.8s)
  - Total generated content count
  - Credits usage tracking
  - 7-day performance history with bar charts
  - Generation count per day
- **Metrics**:
  - Generation speed trends
  - Performance improvements (percentage)
  - Credits consumed vs remaining

#### 6. **Площадки (Platforms)**
- **Purpose**: Manage connected social media platforms
- **Features**:
  - Total connected platforms count
  - Active platforms count
  - Platforms with errors count
  - Platform cards with status
  - Link to platform management page
- **Platform Status**:
  - `connected` - Ready for posting
  - `error` - Requires attention
  - `pending` - Awaiting connection
- **Data Source**: `GET /api/platforms`

#### 7. **Шлюз ИИ (AI Gateway)**
- **Purpose**: Manage AI model integrations
- **Features**:
  - AI model status cards (Stability AI, Runway ML, OpenAI GPT-4, n8n Webhook)
  - Model information (name, purpose, requests today, average time)
  - Status indicators (active, testing)
  - API usage distribution by model
- **Models Tracked**:
  - Stability AI (SDXL 1.0) - Image generation
  - Runway ML (Gen-2) - Video generation
  - OpenAI GPT-4 (gpt-4-turbo) - Script/spec generation
  - n8n Webhook - Automated posting

#### 8. **Использование (Usage)**
- **Purpose**: Track resource consumption and limits
- **Features**:
  - Storage usage (2.4 GB / 10 GB)
  - AI credits (3,760 / 5,000)
  - Project count vs limit
  - Usage breakdown by category (video, images, analysis, scripts)
  - 7-day usage history
- **Categories**:
  - Video generation (49%)
  - Image generation (27%)
  - Style analysis (15%)
  - Script generation (9%)

#### 9. **Настройки (Settings)**
- **Purpose**: Account and system configuration
- **Sections**:
  - **Account**: Email, password, 2FA
  - **Notifications**: Email notifications, error alerts, weekly reports
  - **API Keys**: n8n webhook URL, API key management
  - **Danger Zone**: Delete all projects, delete account

---

## Project Detail Page (`/app/factory/[id]`)

### Purpose
Comprehensive project management interface with full lifecycle control from reference upload to content publishing.

### Tabs (18 Total)

#### 1. **Обзор (Overview)**
- **Purpose**: Project summary and quick actions
- **Features**:
  - Publish notification banner (when status = 'ready')
  - Quick action cards: References, Generation, Content
  - Project information card:
    - Description
    - Target platforms
    - Video format (aspect ratio)
    - Video duration
    - Creation date
  - Style profile card (if analyzed):
    - Mood, tempo
    - Music style, visual style
    - Color palette visualization
  - Recent references grid
  - Project switcher dropdown
- **Actions**:
  - Navigate to upload: `/app/factory/${projectId}/upload`
  - Navigate to publish: `/app/factory/${projectId}/publish`
  - Delete project
  - Switch to another project

#### 2. **Генерации (Deployments)**
- **Purpose**: Track all content generations for this project
- **Features**:
  - Generation statistics (total, ready, posted, generating)
  - Generation list with details:
    - Generation ID (GEN-156)
    - Content name
    - Target platform
    - Time ago
    - Duration
    - Status badge
- **Status Types**:
  - `posted` - Published
  - `ready` - Ready to publish
  - `generating` - In progress

#### 3. **Журналы (Logs)**
- **Purpose**: Project-specific activity log
- **Features**:
  - Filter tabs: Все, Генерация, Загрузка, Публикация, Ошибки
  - Timeline view with color-coded entries
  - Category filtering
- **Log Structure**:
  ```typescript
  {
    time: string,           // "14:32"
    type: 'success' | 'info' | 'warning' | 'error',
    category: 'publish' | 'generation' | 'upload' | 'error',
    message: string,        // "Видео опубликовано в YouTube Shorts"
    detail: string          // "Обзор новой коллекции"
  }
  ```
- **Visual Indicators**:
  - Green dot: Success
  - Blue dot: Info
  - Yellow dot: Warning
  - Red dot: Error

#### 4. **Аналитика (Analytics)**
- **Purpose**: Content performance metrics
- **Features**:
  - Views count with platform breakdown
  - Engagement rate
  - New followers count
  - Top content by views ranking
  - Platform-specific performance
- **Metrics Displayed**:
  - Total views (24.5K)
  - Engagement percentage (8.7%)
  - New followers (+1.2K)
  - Weekly growth trends

#### 5. **Скорость (Speed)**
- **Purpose**: Project-specific performance metrics
- **Features**:
  - Average generation time
  - Generations per hour
  - Uptime percentage (99.9%)
  - 7-day performance history
  - Peak performance tracking

#### 6-17. **Additional Tabs** (Extended Features)
- **Observability** (Наблюдаемость) - System monitoring
- **Firewall** (Фаервол) - Security settings
- **CDN** - Content delivery network
- **Domains** (Площадки) - Connected platforms for this project
- **Integrations** (Интеграции) - Third-party integrations
- **Storage** (Хранилище) - File storage management
- **Flags** (Флаги) - Feature flags
- **Agent** (Агент) - AI agent configuration
- **AI Gateway** (Шлюз ИИ) - AI model management
- **Sandboxes** (Песочницы) - Testing environments
- **Usage** (Использование) - Resource consumption
- **Support** (Поддержка) - Help and support

#### 18. **Настройки (Settings)**
- **Purpose**: Project-specific configuration
- **Features**:
  - Project name and description editing
  - Target platform selection
  - Video format settings
  - Posting schedule configuration
  - n8n webhook URL
  - Delete project option

---

## API Endpoints

### Projects CRUD

#### `GET /api/factory/projects`
- **Purpose**: Get all user's projects
- **Response**: `{ projects: ContentProject[] }`
- **Auth**: Required (cookie token)

#### `GET /api/factory/projects/[id]`
- **Purpose**: Get specific project details
- **Response**: `{ project: ContentProject }`
- **Auth**: Required

#### `POST /api/factory/projects`
- **Purpose**: Create new project
- **Body**: `{ name, description, settings }`
- **Response**: `{ project: ContentProject }`
- **Auth**: Required

#### `PATCH /api/factory/projects/[id]`
- **Purpose**: Update project
- **Body**: Project fields to update
- **Response**: `{ project: ContentProject }`
- **Auth**: Required

#### `DELETE /api/factory/projects/[id]`
- **Purpose**: Delete project and all associated data
- **Response**: `{ message: string }`
- **Auth**: Required

### References Management

#### `GET /api/factory/projects/[id]/references`
- **Purpose**: Get all style references for project
- **Response**: `{ references: StyleReference[] }`

#### `POST /api/factory/projects/[id]/references`
- **Purpose**: Upload new style reference
- **Body**: FormData with file
- **Response**: `{ reference: StyleReference }`

#### `DELETE /api/factory/projects/[id]/references/[refId]`
- **Purpose**: Delete specific reference
- **Response**: `{ message: string }`

### AI Operations

#### `POST /api/factory/projects/[id]/analyze`
- **Purpose**: Analyze uploaded references and create style profile
- **Process**:
  1. Fetch all project references
  2. Use AI to analyze visual style, colors, mood, tempo
  3. Create style profile
  4. Update project with styleProfile
- **Response**: `{ styleProfile: StyleProfile }`
- **AI Service**: `getAIService()` from `@/lib/ai-services`

#### `POST /api/factory/projects/[id]/generate`
- **Purpose**: Generate content using style profile
- **Body**: `{ topic, details, count }`
- **Process**:
  1. Validate project has style profile
  2. Use AI to generate content based on style
  3. Create video/image content
  4. Update project content count
- **Response**: `{ content: GeneratedContent[] }`

### Publishing

#### `POST /api/factory/projects/[id]/publish`
- **Purpose**: Publish content to selected platforms
- **Body**: 
  ```json
  {
    "platforms": ["platformId1", "platformId2"],
    "content": {
      "title": "string",
      "description": "string"
    }
  }
  ```
- **Process**:
  1. Validate project and platforms
  2. For each platform:
     - Check platform connection status
     - Use platform-specific publishing function
     - Record success/failure
  3. Update project status to 'posted'
- **Supported Platforms**:
  - YouTube Shorts
  - TikTok
  - Instagram Reels
  - Pinterest
  - Telegram (via Bot API)
  - VK (via VK API)
  - n8n Webhook (custom automation)
- **Response**: `{ results: PublishResult[] }`

---

## Data Models

### ContentProject
```typescript
interface ContentProject {
  _id: string;
  userId: string;
  name: string;
  description: string;
  status: 'draft' | 'analyzing' | 'generating' | 'ready' | 'posted';
  styleProfile?: {
    colors: string[];
    mood: string;
    tempo: 'slow' | 'medium' | 'fast';
    musicStyle?: string;
    visualStyle?: string;
  };
  referenceCount: number;
  contentCount: number;
  platforms: string[];
  settings: {
    videoDuration: number;        // Default: 60
    aspectRatio: '9:16' | '16:9' | '1:1';
    targetPlatforms: string[];
    postingSchedule: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
      days: number[];
    };
  };
  n8nWebhookUrl: string;
  createdAt: string;
  updatedAt: string;
}
```

### StyleReference
```typescript
interface StyleReference {
  _id: string;
  projectId: string;
  fileName: string;
  fileType: 'video' | 'image' | 'audio';
  fileSize: number;
  fileUrl: string;
  analysisStatus: 'pending' | 'analyzing' | 'completed' | 'error';
  analysis?: {
    colors: string[];
    mood: string;
    tempo: string;
  };
  createdAt: string;
}
```

### ConnectedPlatform
```typescript
interface ConnectedPlatform {
  _id: string;
  userId: string;
  platform: 'youtube-shorts' | 'tiktok' | 'instagram-reels' | 'pinterest' | 'telegram' | 'vk';
  accountName: string;
  accountAvatar?: string;
  credentials: Record<string, any>;
  status: 'connected' | 'error' | 'pending' | 'disconnected';
  postsCount: number;
  lastPosted?: Date;
  settings?: {
    autoPost?: boolean;
    scheduleEnabled?: boolean;
    defaultVisibility?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

## User Flow

### Complete Content Creation Workflow

1. **Create Project**
   - Navigate to `/app/factory/new`
   - Enter project name and description
   - Configure target platforms and settings

2. **Upload References**
   - Navigate to `/app/factory/[id]/upload`
   - Upload images, videos, or audio files
   - Files stored as StyleReference documents

3. **Analyze Style**
   - Trigger analysis via API or UI
   - AI processes all references
   - Creates style profile with colors, mood, tempo
   - Updates project with styleProfile

4. **Generate Content**
   - Navigate to `/app/factory/[id]/generate`
   - Enter topic and details
   - AI generates content using style profile
   - Content count incremented

5. **Review Content**
   - View generated content in Deployments tab
   - Check status (generating → ready)

6. **Publish**
   - Navigate to `/app/factory/[id]/publish`
   - Select target platforms
   - Submit for publishing
   - Content distributed to selected platforms
   - Project status updated to 'posted'

---

## Key Features

### Style Analysis
- Analyzes uploaded references using AI
- Extracts color palettes
- Determines mood and tempo
- Identifies music and visual styles
- Creates reusable style profiles

### Content Generation
- Uses style profiles for consistent branding
- Supports multiple content types (video, images)
- Configurable duration and aspect ratio
- Platform-specific optimization

### Multi-Platform Publishing
- One-click publishing to multiple platforms
- Platform-specific API integrations
- Automated posting schedules
- n8n webhook support for custom workflows

### Real-Time Monitoring
- Activity logs with filtering
- Performance metrics
- Usage tracking
- Error reporting

### Resource Management
- Storage quota tracking
- AI credits management
- Project limits
- Usage analytics

---

## Component Structure

### Factory List Page
```
ContentFactoryPage
├── AppSidebar
├── FactoryTabs (9 tabs)
│   ├── Overview Tab
│   │   └── Project Cards Grid
│   ├── Generations Tab
│   ├── Logs Tab (with filters)
│   ├── Analytics Tab
│   ├── Speed Tab
│   ├── Platforms Tab
│   ├── AI Gateway Tab
│   ├── Usage Tab
│   └── Settings Tab
└── SidebarInset
```

### Project Detail Page
```
ProjectSettingsPage
├── AppSidebar
├── Project Header (with project switcher)
├── FactoryTabs (18 tabs)
│   ├── Overview Tab
│   │   ├── Quick Actions
│   │   ├── Project Info
│   │   ├── Style Profile
│   │   └── Recent References
│   ├── Deployments Tab
│   ├── Logs Tab (with filters)
│   ├── Analytics Tab
│   ├── Speed Tab
│   └── ... (13 more tabs)
└── SidebarInset
```

---

## Styling & UI Patterns

### Tab Navigation
- **Factory Tabs Container**: Sliding indicator with smooth transitions
- **CSS File**: `@/components/FactoryTabs.css`
- **Components**:
  - `.factory-tabs-container` - Relative positioned container
  - `.factory-tab-button` - Individual tab buttons
  - `.tab-indicator` - Sliding background indicator

### Log Filter Tabs
- **Style**: Bottom border tabs (not buttons)
- **Active State**: `border-primary text-primary border-b-2`
- **Inactive State**: `border-transparent text-muted-foreground`
- **Container**: `flex gap-0 border-b border-border`

### Status Badges
- **Draft**: Secondary badge
- **Generating**: Yellow badge
- **Ready**: Green badge
- **Posted**: Blue badge

### Color Coding
- **Success**: Green (#22c55e)
- **Info**: Blue (#3b82f6)
- **Warning**: Yellow (#eab308)
- **Error**: Red (#ef4444)

---

## Error Handling

### Authentication
- Redirects to `/login` if not authenticated
- Token validation on all API calls
- Cookie-based auth (`auth-token`)

### API Errors
- Try-catch blocks on all fetch operations
- User-friendly error messages via alerts
- Console logging for debugging
- Loading states during async operations

### Data Validation
- Project existence checks
- Platform connection validation
- Style profile requirements before generation
- File type validation for uploads

---

## Integration Points

### AI Services
- **Location**: `@/lib/ai-services.ts`
- **Function**: `getAIService()`
- **Used For**:
  - Style analysis
  - Content generation
  - Script writing

### Platform APIs
- **Telegram**: Bot API (`sendMessage`)
- **VK**: VK API (`wall.post`)
- **Instagram**: Graph API
- **YouTube**: YouTube Data API
- **TikTok**: TikTok API
- **Pinterest**: Pinterest API
- **n8n**: Webhook integration

### Database
- **MongoDB** with Mongoose ODM
- **Models**:
  - `ContentProject`
  - `StyleReference`
  - `PlatformConnection`
  - `User`

---

## Routes Summary

| Route | Purpose |
|-------|---------|
| `/app/factory` | Projects list dashboard |
| `/app/factory/new` | Create new project |
| `/app/factory/[id]` | Project detail & settings |
| `/app/factory/[id]/upload` | Upload references |
| `/app/factory/[id]/generate` | Generate content |
| `/app/factory/[id]/publish` | Publish to platforms |
| `/app/platforms` | Manage platform connections |

---

## Best Practices for AI Agents

### When Working with This Module

1. **Always check authentication** before making API calls
2. **Use proper error handling** with try-catch blocks
3. **Validate data** before submitting forms
4. **Show loading states** during async operations
5. **Update UI** after successful mutations
6. **Filter logs** using the category field
7. **Check project status** before allowing actions
8. **Use TypeScript interfaces** for type safety

### Common Operations

```typescript
// Fetch all projects
const response = await fetch('/api/factory/projects');
const data = await response.json();

// Create project
const response = await fetch('/api/factory/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, description, settings })
});

// Analyze references
const response = await fetch(`/api/factory/projects/${id}/analyze`, {
  method: 'POST'
});

// Generate content
const response = await fetch(`/api/factory/projects/${id}/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic, details, count })
});

// Publish content
const response = await fetch(`/api/factory/projects/${id}/publish`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ platforms, content })
});
```

---

## Future Enhancements

- [ ] Real-time generation progress tracking
- [ ] Batch operations for multiple projects
- [ ] Advanced analytics with charts
- [ ] A/B testing for content
- [ ] Collaboration features
- [ ] Template system for quick project creation
- [ ] AI model selection per project
- [ ] Custom webhook integrations
- [ ] Content approval workflows
- [ ] Version control for generated content

---

**Last Updated**: 2026-04-17
**Version**: 1.0.0
**Maintainer**: Development Team
