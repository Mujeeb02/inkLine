import { model, models, Schema, type Model, type Types } from "mongoose";
import type { JSONContent } from "@tiptap/react";
import { EMPTY_DOCUMENT_CONTENT } from "@/modules/shared/constants";

export type VersionType = {
  _id: Types.ObjectId;
  documentId: Types.ObjectId;
  savedBy: Types.ObjectId;
  savedByEmail: string;
  title: string;
  content: JSONContent;
  version: number;
  createdAt: Date;
};

const versionSchema = new Schema<VersionType>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    savedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    savedByEmail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: Schema.Types.Mixed,
      default: EMPTY_DOCUMENT_CONTENT,
    },
    version: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

versionSchema.index({ documentId: 1, createdAt: -1 });

export const VersionModel =
  (models.Version as Model<VersionType> | undefined) ||
  model<VersionType>("Version", versionSchema);
