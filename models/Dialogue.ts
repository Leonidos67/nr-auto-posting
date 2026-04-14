import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  role: 'user' | 'assistant';
  prompt?: string;
  imageUrl?: string;
  imageReferences?: string[];
  settings?: {
    mode: '1kSD' | '2kHD';
    aspectRatio: string;
    imageCount: number;
  };
  createdAt: Date;
}

export interface IDialogue extends Document {
  userId: mongoose.Types.ObjectId;
  modelVersion: 'image-2.0' | 'image-1.0';
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    prompt: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    imageReferences: [{
      type: String,
    }],
    settings: {
      mode: {
        type: String,
        enum: ['1kSD', '2kHD'],
        default: '1kSD',
      },
      aspectRatio: {
        type: String,
        default: '1:1',
      },
      imageCount: {
        type: Number,
        default: 1,
      },
    },
  },
  {
    timestamps: true,
  }
);

const DialogueSchema = new Schema<IDialogue>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modelVersion: {
      type: String,
      enum: ['image-2.0', 'image-1.0'],
      default: 'image-2.0',
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

// Prevent model compilation error in development
const Dialogue = mongoose.models.Dialogue || mongoose.model<IDialogue>('Dialogue', DialogueSchema);

export default Dialogue;
