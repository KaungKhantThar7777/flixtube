const express = require("express");
const http = require("http");
const amqplib = require("amqplib");
const fs = require("fs");

const PORT = process.env.PORT;
const RABBIT = process.env.RABBIT;
if (!PORT || !RABBIT) {
  throw new Error("PORT and RABBIT must be defined!!!");
}

async function main() {
  console.log(`Connecting to RabbitMQ server at ${RABBIT}.`);

  const connection = await amqplib.connect(RABBIT);

  const messageChannel = await connection.createChannel();

  function sendViewedMessage(messageChannel, videoPath) {
    console.log(`Publishing message on "viewed" queue.`);

    const msg = { videoPath };
    const stringMsg = JSON.stringify(msg);

    messageChannel.publish("", "viewed", Buffer.from(stringMsg));
  }
  const app = express();

  app.get("/video", async (req, res) => {
    console.log("get /video");

    const videoPath = "./videos/SampleVideo_1280x720_1mb.mp4";
    const stats = await fs.promises.stat(videoPath);

    res.writeHead(200, {
      "Content-Length": stats.size,
      "Content-Type": "video/mp4",
    });

    fs.createReadStream(videoPath).pipe(res);

    sendViewedMessage(messageChannel, videoPath);
  });

  app.listen(PORT, () => {
    console.log("Microservice online.");
  });
}

main().catch((err) => {
  console.error("Microservice failed to start.");
  console.error((err && err.stack) || err);
});
