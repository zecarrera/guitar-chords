import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/lib/data";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "guitar-chords",
    databaseConfigured: isDatabaseConfigured(),
  });
}
