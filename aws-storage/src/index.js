import express from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { fromSSO } from "@aws-sdk/credential-providers";

const app = express();

const PORT = process.env.PORT;
const AWS_REGION = process.env.AWS_REGION;
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_SSO_PROFILE = process.env.AWS_SSO_PROFILE;

if (!PORT || !AWS_REGION || !AWS_S3_BUCKET || !AWS_SSO_PROFILE) {
  throw new Error(
    "PORT,AWS_REGION,AWS_S3_BUCKET and AWS_SSO_PROFILE must be defined!!"
  );
}

app.get("/video", async (req, res) => {
  const videoPath = req.query.path;

  if (!videoPath) {
    return res.json({ message: "Invalid path" });
  }
  try {
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: fromSSO({ profile: AWS_SSO_PROFILE }),
    });
    const { Body, ContentLength, ContentType } = await s3Client.send(
      new GetObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: videoPath,
      })
    );

    res.writeHead(200, {
      "Content-Type": ContentType,
      "Content-Length": ContentLength,
    });
    Body.pipe(res);
  } catch (error) {
    console.log({ error });
  }
});

app.listen(PORT, () => {
  console.log(`Aws Storage is listening on port: ${PORT}`);
});
