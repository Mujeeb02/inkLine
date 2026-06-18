import { model, models, Schema, type Model, type Types } from "mongoose";

export type PresenceType = {
  _id: Types.ObjectId;
  documentId: Types.ObjectId;
  userId: Types.ObjectId;
  email: string;
  lastSeen: Date;
};

const presenceSchema = new Schema<PresenceType>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    lastSeen: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// TTL index to automatically expire entries after 30 seconds
presenceSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 30 });
presenceSchema.index({ documentId: 1, lastSeen: -1 });

export const PresenceModel =
  (models.Presence as Model<PresenceType> | undefined) ||
  model<PresenceType>("Presence", presenceSchema);
