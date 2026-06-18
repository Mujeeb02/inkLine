import { UserController } from "../src/modules/user/user.controller";
import mongoose from "mongoose";

async function run() {
  console.log("Starting user list test...");
  try {
    const res = await UserController.list();
    console.log("Result:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
