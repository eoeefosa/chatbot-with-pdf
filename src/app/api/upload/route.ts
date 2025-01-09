import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const { file } = (await req.json()) as { file: string };
    const pdfBuffer = Buffer.from(file, "base64");
    const data = await pdf(pdfBuffer);
    return Response.json({ text: data.text });
} catch (error: unknown) {
const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
return NextResponse.json(
    { error: `Failed to parse PDF: ${errorMessage}` },
    { status: 500 }
);
  }
}
