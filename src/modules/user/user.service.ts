import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import { UserRepository } from "./user.repository";
import { SEEDED_USERS } from "@/modules/shared/constants";
import { dbConnect } from "@/modules/shared/database/db";

const SALT_ROUNDS = 12;

export class UserService {
  static async ensureSeedUsers() {
    await dbConnect();
    return UserRepository.ensureSeedUsers(SEEDED_USERS);
  }

  static async createUser(email: string, password?: string) {
    await dbConnect();
    const passwordHash = password ? await bcrypt.hash(password, SALT_ROUNDS) : undefined;
    return UserRepository.create(email, passwordHash);
  }

  static async verifyPassword(email: string, password: string): Promise<boolean> {
    await dbConnect();
    const user = await UserRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      // Seeded users without a password hash cannot log in with password auth
      return false;
    }
    return bcrypt.compare(password, user.passwordHash);
  }

  static async getAllUsers() {
    await dbConnect();
    // Ensure seeded users exist before listing
    await UserRepository.ensureSeedUsers(SEEDED_USERS);
    return UserRepository.findAll();
  }

  static async getUserByEmail(email: string) {
    await dbConnect();
    return UserRepository.findByEmail(email);
  }

  static async getUserById(id: string) {
    await dbConnect();
    return UserRepository.findById(id);
  }

  static async getUserEmailByIdMap(userIds: (string | Types.ObjectId)[]) {
    await dbConnect();
    const uniqueIds = [...new Set(userIds.map((userId) => userId.toString()))];

    if (!uniqueIds.length) {
      return new Map<string, string>();
    }

    const users = (await UserRepository.findByIds(uniqueIds)) as unknown as {
      _id: Types.ObjectId;
      email: string;
    }[];

    return new Map(users.map((user) => [user._id.toString(), user.email]));
  }
}

