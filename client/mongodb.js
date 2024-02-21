const http = require('http')

//mongodb.js
const { MongoClient } = require("mongodb")
const url = "mongodb://127.0.0.1:27017"
const client = new MongoClient(url)

const dbName = "chat"
const collectionName = "location"
const insertMany = async (data) => {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    await collection.insertOne(data)
    client.close();
    console.log('信息缓存成功！')
  } catch (err) {
    console.log('信息缓存失败！', err)
  }
  return "done"
};


async function getLatestData() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db(dbName)
    const collection = database.collection(collectionName)

    const result = await collection.find({}).toArray();

    return result;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  } finally {
    await client.close();
  }
}
module.exports = { insertMany, getLatestData }
