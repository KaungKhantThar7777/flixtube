const express = require("express");

const PORT = process.env.PORT;

async function main() {
  const app = express();

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
