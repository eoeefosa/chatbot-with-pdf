import { NextRequest } from "next/server";
import pdf from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const { file } = (await req.json()) as { file: string };
    const pdfBuffer = Buffer.from(file, "base64");
    const data = await pdf(pdfBuffer);
    return Response.json({ text: data.text });
  } catch (error: any) {
    return Response.json(
      { error: `Failed to parse PDF ${error.message} ` },
      { status: 500 }
    );
  }
}
