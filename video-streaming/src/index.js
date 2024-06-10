const express = require("express");
const http = require("http");

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = process.env.VIDEO_STORAGE_PORT;

if (!PORT || !VIDEO_STORAGE_HOST || !VIDEO_STORAGE_PORT) {
  throw new Error(
    "PORT,VIDEO_STORAGE_HOST and VIDEO_STORAGE_PORT must be defined!!!"
  );
}

const app = express();

app.get("/video", async (req, res) => {
  const videoPath = "/video?path=SampleVideo_1280x720_1mb.mp4";

  const forwardRequest = http.request(
    {
      host: VIDEO_STORAGE_HOST,
      port: VIDEO_STORAGE_PORT,
      path: videoPath,
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
