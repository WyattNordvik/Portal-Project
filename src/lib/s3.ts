// src/lib/s3.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const endpoint = new URL(process.env.SPACES_ENDPOINT!);

const s3 = new S3Client({
  endpoint,                                    // point at Spaces
  region: endpoint.hostname.split(".")[1],     // e.g. "nyc3"
  credentials: {
    accessKeyId: process.env.SPACES_KEY!,
    secretAccessKey: process.env.SPACES_SECRET!,
  },
});

const BUCKET = process.env.SPACES_BUCKET!;

export async function uploadFile(key: string, body: Uint8Array | Buffer) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ACL: "public-read",       // or omit if private
    })
  );
  return `${process.env.SPACES_ENDPOINT}/${BUCKET}/${key}`;
}

export async function deleteFile(key: string) {
  await s3.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  );
}

export function getFileUrl(key: string) {
  return `${process.env.SPACES_ENDPOINT}/${BUCKET}/${key}`;
}

