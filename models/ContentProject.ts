import mongoose, { Document, Schema } from 'mongoose';

export interface IContentProject extends Document {
  userId: mongoose.Types.ObjectId;
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
    videoDuration?: number; // в секундах
    aspectRatio: '9:16' | '16:9' | '1:1';
    targetPlatforms: string[];
    postingSchedule?: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      time?: string; // HH:MM
      days?: number[]; // 0-6 (Sun-Sat)
    };
  };
  n8nWebhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentProjectSchema = new Schema<IContentProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'analyzing', 'generating', 'ready', 'posted'],
      default: 'draft',
    },
    styleProfile: {
      colors: [String],
      mood: String,
      tempo: {
        type: String,
        enum: ['slow', 'medium', 'fast'],
      },
      musicStyle: String,
      visualStyle: String,
    },
    referenceCount: {
      type: Number,
      default: 0,
    },
    contentCount: {
      type: Number,
      default: 0,
    },
    platforms: {
      type: [String],
      default: [],
    },
    settings: {
      videoDuration: {
        type: Number,
        default: 60,
      },
      aspectRatio: {
        type: String,
        enum: ['9:16', '16:9', '1:1'],
        default: '9:16',
      },
      targetPlatforms: [String],
      postingSchedule: {
        enabled: {
          type: Boolean,
          default: false,
        },
        frequency: {
          type: String,
          enum: ['daily', 'weekly', 'monthly'],
        },
        time: String,
        days: [Number],
      },
    },
    n8nWebhookUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index для быстрого поиска по пользователю
ContentProjectSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.ContentProject ||
  mongoose.model<IContentProject>('ContentProject', ContentProjectSchema);
