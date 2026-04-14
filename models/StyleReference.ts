import mongoose, { Document, Schema } from 'mongoose';

export interface IStyleReference extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileName: string;
  fileType: 'video' | 'image' | 'audio';
  fileSize: number;
  duration?: number; // для видео/аудио в секундах
  metadata?: {
    width?: number;
    height?: number;
    fps?: number;
    codec?: string;
    colors?: string[];
  };
  analysisStatus: 'pending' | 'analyzing' | 'completed' | 'failed';
  analysisResult?: {
    dominantColors: string[];
    mood: string;
    tempo?: 'slow' | 'medium' | 'fast';
    visualStyle?: string;
    objects?: string[];
    scene?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StyleReferenceSchema = new Schema<IStyleReference>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'ContentProject',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      enum: ['video', 'image', 'audio'],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
    },
    metadata: {
      width: Number,
      height: Number,
      fps: Number,
      codec: String,
      colors: [String],
    },
    analysisStatus: {
      type: String,
      enum: ['pending', 'analyzing', 'completed', 'failed'],
      default: 'pending',
    },
    analysisResult: {
      dominantColors: [String],
      mood: String,
      tempo: {
        type: String,
        enum: ['slow', 'medium', 'fast'],
      },
      visualStyle: String,
      objects: [String],
      scene: String,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для быстрого поиска
StyleReferenceSchema.index({ projectId: 1, createdAt: -1 });
StyleReferenceSchema.index({ userId: 1 });

export default mongoose.models.StyleReference ||
  mongoose.model<IStyleReference>('StyleReference', StyleReferenceSchema);
