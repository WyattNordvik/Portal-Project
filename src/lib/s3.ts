
// src/lib/s3.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Use the endpoint URL as a string
const endpointUrl = process.env.SPACES_ENDPOINT!;
// Parse it into a URL object to extract hostname
const endpointObj = new URL(endpointUrl);
// Region is the first segment of the hostname, e.g. 'nyc3' from 'nyc3.digitaloceanspaces.com'
const region = endpointObj.hostname.split(".")[0];

// Initialize the S3-compatible client with DigitalOcean Spaces endpoint
export const s3 = new S3Client({
  endpoint: endpointUrl,
  region,
  credentials: {
    accessKeyId: process.env.SPACES_KEY!,
    secretAccessKey: process.env.SPACES_SECRET!,
  },
});

export const BUCKET = process.env.SPACES_BUCKET!;

/** Uploads a Buffer or Uint8Array to Spaces and returns the public URL */
export async function uploadFile(key: string, body: Buffer | Uint8Array) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ACL: "public-read",
    })
  );
  return `${endpointUrl}/${BUCKET}/${key}`;
}

/** Deletes an object from Spaces */
export async function deleteFile(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

/** Returns the public URL for a given key */
export function getFileUrl(key: string) {
  return `${endpointUrl}/${BUCKET}/${key}`;
}

