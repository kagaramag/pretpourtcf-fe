import { NextResponse } from "next/server";

// This value is generated at build time and changes on every deploy
const BUILD_ID = process.env.BUILD_ID || Date.now().toString();

export async function GET() {
  return NextResponse.json(
    { version: BUILD_ID },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
