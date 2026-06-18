import { model, models, Schema, type Model, type Types } from "mongoose";

export type CommentSelection = {
  from: number;
  to: number;
  text: string;
};

export type CommentType = {
  _id: Types.ObjectId;
  documentId: Types.ObjectId;
  authorId: Types.ObjectId;
  authorEmail: string;
  body: string;
  resolved: boolean;
  selection?: CommentSelection;
  createdAt: Date;
  updatedAt: Date;
};

const commentSchema = new Schema<CommentType>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorEmail: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    resolved: {
      type: Boolean,
      required: true,
      default: false,
    },
    selection: {
      from: { type: Number },
      to: { type: Number },
      text: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ documentId: 1, resolved: 1 });

export const CommentModel =
  (models.Comment as Model<CommentType> | undefined) ||
  model<CommentType>("Comment", commentSchema);
