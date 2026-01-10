import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // permanent redirect to the pricing page
  const url = new URL(request.url);
  url.pathname = "/pricing";
  return NextResponse.redirect(url, 307);
}
