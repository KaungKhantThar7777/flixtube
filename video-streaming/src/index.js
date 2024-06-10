const express = require("express");
const fs = require("fs");

if (!process.env.PORT) {
  throw new Error("PORT must be defined!!!");
}
const PORT = process.env.PORT;

const app = express();

app.get("/video", async (req, res) => {
  const videoPath = "./videos/SampleVideo_1280x720_1mb.mp4";

  const stats = await fs.promises.stat(videoPath);

  res.writeHead(200, {
    "Content-Length": stats.size,
    "Content-Type": "video/mp4",
  });

  fs.createReadStream(videoPath).pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} v2 update.`);
});
