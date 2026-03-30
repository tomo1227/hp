import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminApi";

export const runtime = "nodejs";

const getS3Client = () => {
  const region = process.env.NEXT_PUBLIC_AWS_REGION;
  const accessKeyId = process.env.NEXT_PUBLIC_IAM_ACCESS_KEY_SECRET;
  const secretAccessKey = process.env.NEXT_PUBLIC_IAM_SECRET_ACCESS_KEY_SECRET;

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

  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  if (!bucket) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_S3_BUCKET_NAME is required" },
      { status: 500 },
    );
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(getS3Client() as any, command as any, {
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
