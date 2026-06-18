import mongoose from "mongoose";
import { dbConnect } from "../../shared/database/db";

export async function runMigration() {
  await dbConnect();
  
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database not connected");
  }
  
  const cursor = db.collection("documents").find({});
  let migratedCount = 0;
  
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) continue;
    
    if (Array.isArray(doc.sharedWith) && doc.sharedWith.length > 0) {
      const firstEntry = doc.sharedWith[0];
      
      const needsMigration = 
        firstEntry instanceof mongoose.Types.ObjectId ||
        typeof firstEntry === "string" ||
        (typeof firstEntry === "object" && firstEntry !== null && !("userId" in firstEntry));
        
      if (needsMigration) {
        const newSharedWith = doc.sharedWith.map((user: any) => {
          const userId = user instanceof mongoose.Types.ObjectId || typeof user === "string" 
            ? user 
            : (user._id || user.id);
          return {
            userId: typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId,
            role: "editor",
          };
        });
        
        await db.collection("documents").updateOne(
          { _id: doc._id },
          { $set: { sharedWith: newSharedWith } }
        );
        migratedCount++;
      }
    }
  }
  
  console.log(`Successfully migrated ${migratedCount} documents.`);
  return migratedCount;
}

// Allow running directly if run via node/ts-node
if (require.main === module) {
  runMigration()
    .then((count) => {
      console.log(`Migration done. Migrated ${count} documents.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
