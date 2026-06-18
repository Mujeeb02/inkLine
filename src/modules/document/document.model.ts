import { model, models, Schema, type Model, type Types } from "mongoose";
import type { JSONContent } from "@tiptap/react";
import { EMPTY_DOCUMENT_CONTENT } from "@/modules/shared/constants";

export type MongooseSharedEntry = {
  userId: Types.ObjectId;
  role: "viewer" | "commenter" | "editor";
};

export type DocumentType = {
  _id: Types.ObjectId;
  title: string;
  content: JSONContent;
  ownerId: Types.ObjectId;
  sharedWith: MongooseSharedEntry[];
  createdAt: Date;
  updatedAt: Date;
};

const documentSchema = new Schema<DocumentType>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: Schema.Types.Mixed,
      default: EMPTY_DOCUMENT_CONTENT,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["viewer", "commenter", "editor"],
          default: "editor",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

documentSchema.index({ ownerId: 1, updatedAt: -1 });
documentSchema.index({ "sharedWith.userId": 1, updatedAt: -1 });

export const DocumentModel =
  (models.Document as Model<DocumentType> | undefined) ||
  model<DocumentType>("Document", documentSchema);
