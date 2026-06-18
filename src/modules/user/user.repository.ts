import { Types } from "mongoose";
import { UserModel } from "./user.model";

export class UserRepository {
  static async create(email: string, passwordHash?: string) {
    return UserModel.create({ email, ...(passwordHash ? { passwordHash } : {}) });
  }

  static async findAll() {
    return UserModel.find({}).lean().exec();
  }

  static async findByEmail(email: string) {
    return UserModel.findOne({ email }).lean().exec();
  }

  static async findById(id: string | Types.ObjectId) {
    return UserModel.findById(id).lean().exec();
  }

  static async findByIds(ids: (string | Types.ObjectId)[]) {
    return UserModel.find({ _id: { $in: ids } })
      .select("email")
      .lean()
      .exec();
  }

  static async ensureSeedUsers(users: { email: string }[]) {
    return UserModel.bulkWrite(
      users.map((user) => ({
        updateOne: {
          filter: { email: user.email },
          update: { $setOnInsert: { email: user.email } },
          upsert: true,
        },
      })),
    );
  }
}
