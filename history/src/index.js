const express = require("express");
const mongodb = require("mongodb");
const amqplib = require("amqplib");

const PORT = process.env.PORT;
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;
const RABBIT = process.env.RABBIT;

if (!process.env.PORT) {
  throw new Error(
    "Please specify the port number for the HTTP server with the environment variable PORT."
  );
}

if (!process.env.DBHOST) {
  throw new Error(
    "Please specify the database host using environment variable DBHOST."
  );
}

if (!process.env.DBNAME) {
  throw new Error(
    "Please specify the name of the database using environment variable DBNAME"
  );
}

if (!process.env.RABBIT) {
  throw new Error(
    "Please specify the name of the RabbitMQ host using environment variable RABBIT"
  );
}

async function main() {
  const client = await mongodb.MongoClient.connect(DBHOST);
  const db = client.db(DBNAME);
  const historyCollection = db.collection("history");

  const messageConnection = await amqplib.connect(RABBIT);

  const messageChannel = await messageConnection.createChannel();

  await messageChannel.assertQueue("viewed", {});

  console.log(`Created "viewed" queue.`);

  await messageChannel.consume("viewed", async (msg) => {
    console.log("Received a 'viewed' message");

    const parsedMsg = JSON.parse(msg.content.toString());

    await historyCollection.insertOne({ videoPath: parsedMsg.videoPath });

    console.log("Acknowledged 'viewed' message");

    messageChannel.ack(msg);
  });

  const app = express();

  app.use(express.json());

  app.post("/viewed", async (req, res) => {
    const videoPath = req.body.videoPath;

    await historyCollection.insertOne({ videoPath });

    console.log(`Added video ${videoPath} to history.`);
    res.sendStatus(200);
  });

  app.get("/", (req, res) => {
    res.send("hello world");
  });

  app.listen(PORT, () => {
    console.log("History microservice is online");
  });
}

main().catch((err) => {
  console.error("History microservice is failed to start");
  console.error((err && err.stack) || err);
});
