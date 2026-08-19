import { MongoMemoryServer } from "mongodb-memory-server";

const mongod = await MongoMemoryServer.create({ instance: { dbName: "lifeos" } });
process.env.MONGO_URI = mongod.getUri("lifeos");
console.log(`In-memory MongoDB started at ${process.env.MONGO_URI}`);

process.on("SIGINT", async () => {
  await mongod.stop();
  process.exit(0);
});

await import("../src/server.js");
