const express = require("express");
const http = require("http");
const mongodb = require("mongodb");

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = process.env.VIDEO_STORAGE_PORT;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

async function main() {
  if (
    !PORT ||
    !VIDEO_STORAGE_HOST ||
    !VIDEO_STORAGE_PORT ||
    !DB_HOST ||
    !DB_NAME
  ) {
    throw new Error(
      "PORT,VIDEO_STORAGE_HOST,VIDEO_STORAGE_PORT, DB_HOST and DB_NAME must be defined!!!"
    );
  }

  const client = await mongodb.MongoClient.connect(DB_HOST);
  const db = client.db(DB_NAME);

  const videosCollection = db.collection("videos");

  const app = express();

  app.get("/video", async (req, res) => {
    const videoId = new mongodb.ObjectId(req.query.id);
    console.log({ videoId });
    const videoRecord = await videosCollection.findOne({ _id: videoId });

    if (!videoRecord) {
      res.sendStatus(404);

      return;
    }

    const forwardRequest = http.request(
      {
        host: VIDEO_STORAGE_HOST,
        port: VIDEO_STORAGE_PORT,
        path: `/video?path=${videoRecord.videoPath}`,
        method: "GET",
        headers: req.headers,
      },
      (forwardResponse) => {
        res.writeHead(forwardResponse.statusCode, forwardResponse.headers);

        forwardResponse.pipe(res);
      }
    );

    req.pipe(forwardRequest);
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} v2 update.`);
  });
}

main().catch((err) => {
  console.error("Microservice failed to start");
  console.error((err && err.stack) || err);
});
