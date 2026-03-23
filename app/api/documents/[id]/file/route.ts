import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type DocumentFileRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: DocumentFileRouteProps) {
  const { id } = await params;
  const document = await prisma.chordDocument.findUnique({
    where: {
      id,
    },
    select: {
      fileData: true,
      fileName: true,
      mimeType: true,
    },
  });

  if (!document?.fileData) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new Response(new Uint8Array(document.fileData), {
    headers: {
      "Content-Type": document.mimeType ?? "application/pdf",
      "Content-Disposition": `inline; filename="${document.fileName ?? "document.pdf"}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
