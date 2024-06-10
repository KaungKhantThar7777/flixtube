import express from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { fromSSO } from "@aws-sdk/credential-provider-sso";

const app = express();

const PORT = process.env.PORT;
const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const AWS_SSO_PROFILE = process.env.AWS_SSO_PROFILE;

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
        Bucket: S3_BUCKET_NAME,
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
