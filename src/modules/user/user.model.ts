import { model, models, Schema, type Model } from "mongoose";

export type UserType = {
  email: string;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserType>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel =
  (models.User as Model<UserType> | undefined) || model<UserType>("User", userSchema);
