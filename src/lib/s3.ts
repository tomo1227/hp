import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  NoSuchKey,
  S3ServiceException,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_IAM_ACCESS_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_IAM_SECRET_ACCESS_KEY!,
  },
});

export async function getImgFromS3(imagePath:string): Promise<string> {  // Base64エンコードされた画像のURLを返す
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: imagePath,
    });
    const response = await s3Client.send(command);

    const body = response.Body;

    // response.BodyがReadableStreamかBlobの場合を判定
    console.log('response.Body type:', typeof body);

    // BodyがReadableStreamの場合
    if (body instanceof ReadableStream) {
      const reader = body.getReader();
      const chunks: Uint8Array[] = [];
      
      // ReadableStreamからデータを取得
      const processStream = async () => {
        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          if (value) chunks.push(value);
          done = streamDone;
        }
      };
      
      await processStream();
      
      // Uint8Arrayのチャンクを結合してBufferに変換
      const buffer = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
      return buffer.toString('base64');
    }

    throw new Error("Unknown response body type");

  } catch (error) {
    console.error("Error getting file:", error);
    throw error;
  }
}


export const getZipFromS3 = async ({ filePath }: { filePath: string }) => {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: filePath,
      })
    );

    const body = response.Body;
    if (!body) {
      throw new Error("No body in the S3 response.");
    }

    // バイナリデータとして返す
    const chunks: Buffer[] = [];
    for await (const chunk of body as NodeJS.ReadableStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength); // ArrayBufferを返す
  } catch (caught) {
    if (caught instanceof NoSuchKey) {
      console.error(
        `Error from S3 while getting object "${filePath}" from "${process.env.NEXT_PUBLIC_S3_BUCKET_NAME!}". No such key exists.`
      );
    } else if (caught instanceof S3ServiceException) {
      console.error(
        `Error from S3 while getting object from ${process.env.NEXT_PUBLIC_S3_BUCKET_NAME!}. ${caught.name}: ${caught.message}`
      );
    } else {
      throw caught;
    }
  }
};