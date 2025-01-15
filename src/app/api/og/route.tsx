import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hasTitle = searchParams.has("title");
    const title = hasTitle
      ? searchParams.get("title")?.slice(0, 100)
      : "My default title";
    return new ImageResponse(
      <div
        style={{
          backgroundImage:
            "url(https://tomokiota-photos.s3.ap-northeast-1.amazonaws.com/ogp/og-template.png)",
          backgroundColor: "#fff",
          backgroundSize: "100% 100%",
          height: "100%",
          width: "100%",
          display: "flex",
          textAlign: "left",
          alignItems: "flex-start",
          justifyContent: "center",
          flexDirection: "column",
          flexWrap: "nowrap",
        }}
      >
        <div
          style={{
            width: "100%",
            fontSize: 60,
            fontStyle: "normal",
            fontWeight: "bold",
            color: "#000",
            padding: "0 120px",
            lineHeight: 1.3,
            marginBottom: "30px",
            wordWrap: "break-word",
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: "100%",
            fontSize: 40,
            fontStyle: "normal",
            fontWeight: "bold",
            color: "#000",
            padding: "0 120px",
            lineHeight: 1.3,
          }}
        >
          ✏️ OG Image Examples
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.log(e);
    return new Response("failed to generate the image.", {
      status: 500,
    });
  }
  // return new Response("Success!", {
  //   status: 200,
  // });
}
