import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformConnection extends Document {
  userId: mongoose.Types.ObjectId;
  platform: string;
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

const PlatformConnectionSchema = new Schema<IPlatformConnection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      enum: [
        'youtube-shorts',
        'tiktok',
        'instagram-reels',
        'pinterest',
        'telegram',
        'vk',
      ],
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    accountAvatar: {
      type: String,
    },
    credentials: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['connected', 'error', 'pending', 'disconnected'],
      default: 'connected',
    },
    postsCount: {
      type: Number,
      default: 0,
    },
    lastPosted: {
      type: Date,
    },
    settings: {
      autoPost: {
        type: Boolean,
        default: true,
      },
      scheduleEnabled: {
        type: Boolean,
        default: false,
      },
      defaultVisibility: {
        type: String,
        default: 'public',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index для быстрого поиска по пользователю и платформе
PlatformConnectionSchema.index({ userId: 1, platform: 1 }, { unique: true });
PlatformConnectionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.PlatformConnection ||
  mongoose.model<IPlatformConnection>('PlatformConnection', PlatformConnectionSchema);
