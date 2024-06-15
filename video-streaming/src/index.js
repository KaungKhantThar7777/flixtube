const express = require("express");
const http = require("http");
const fs = require("fs");

if (!process.env.PORT) {
  throw new Error("PORT must be defined!!!");
}
const PORT = process.env.PORT;

const app = express();
let count = 0;
function sendViewedMessage(videoPath) {
  console.log(count++);
  const postOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const requestBody = {
    videoPath,
  };

  const req = http.request("http://history/viewed", postOptions);

  req.on("end", () => {
    console.log("Sent `viewed` message to history microservice");
  });

  req.on("error", (err) => {
    console.error("Failed to send 'viewed' message!");
    console.error((err && err.stack) || err);
  });

  req.write(JSON.stringify(requestBody));
  req.end();
}

async function main() {
  const app = express();

  app.get("/video", async (req, res) => {
    console.log("get /video");
    // Route for streaming video.

    const videoPath = "./videos/SampleVideo_1280x720_1mb.mp4";
    const stats = await fs.promises.stat(videoPath);

    res.writeHead(200, {
      "Content-Length": stats.size,
      "Content-Type": "video/mp4",
    });

    fs.createReadStream(videoPath).pipe(res);

    sendViewedMessage(videoPath); // Sends the "viewed" message to indicate this video has been watched.
  });

  app.listen(PORT, () => {
    console.log("Microservice online.");
  });
}

main().catch((err) => {
  console.error("Microservice failed to start.");
  console.error((err && err.stack) || err);
});
