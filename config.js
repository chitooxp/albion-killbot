const MongoClient = require("mongodb").MongoClient;

const MONGODB_URL = process.env.MONGODB_URL;
const SERVER_CONFIG_COLLECTION = "guildConfig";
const DEFAULT_CONFIG = {
  playerIds: [],
  guildIds: [],
  allianceIds: []
};

if (!MONGODB_URL) {
  console.log(
    "Please define MONGODB_URL environment variable with the MongoDB location. Guild config is disabled."
  );
}

const client = new MongoClient(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
let db;

exports.connect = async () => {
  try {
    await client.connect();
    console.log("Connected to database.");
    db = client.db();
  } catch (e) {
    console.log(
      `Unable to connect to database: ${e}. Guild config is disabled.`
    );
  }
};

// TODO: Implement bulk get/write guild config
exports.getConfig = async guild => {
  if (!db) {
    return DEFAULT_CONFIG;
  }
  const collection = db.collection(SERVER_CONFIG_COLLECTION);
  try {
    const guildConfig = await collection.findOne({ guild });
    if (!guildConfig) {
      return DEFAULT_CONFIG;
    }
    return guildConfig;
  } catch (e) {
    console.log(`Unable to find guildConfig for guild ${guild}: ${e}`);
    return DEFAULT_CONFIG;
  }
};

exports.setConfig = async (guild, config) => {
  if (!db) {
    return DEFAULT_CONFIG;
  }
  const collection = db.collection(SERVER_CONFIG_COLLECTION);
  try {
    const guildConfig = await collection.updateOne(
      { guild },
      { $set: config },
      { upsert: true }
    );
    if (!guildConfig) {
      return false;
    }
    return guildConfig;
  } catch (e) {
    console.log(`Unable to write guildConfig for guild ${guild}: ${e}`);
    return false;
  }
};