import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminApi";

export const runtime = "nodejs";

const getS3Client = () => {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are required");
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

export async function POST(request: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key, contentType } = (await request.json()) as {
    key?: string;
    contentType?: string;
  };

  if (!key || !contentType) {
    return NextResponse.json(
      { error: "key and contentType are required" },
      { status: 400 },
    );
  }

  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) {
    return NextResponse.json(
      { error: "S3_BUCKET_NAME is required" },
      { status: 500 },
    );
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(getS3Client(), command, {
      expiresIn: 60 * 5,
    });

    return NextResponse.json({
      uploadUrl,
      key,
      bucket,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create presigned URL",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
