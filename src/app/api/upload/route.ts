// app/api/upload-pdf/route.ts
import { NextRequest } from "next/server";
import pdf from "pdf-parse";

export async function POST(request: NextRequest) {
  try {
    // Log the start of request handling
    console.log("Received PDF upload request");

    const data = await request.json();
    //   const data = await request.text();

    // Validate incoming data
    if (!data || !data.file) {
      console.error("Missing file data in request");
      return new Response(JSON.stringify({ error: "No file data provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert base64 to buffer and parse PDF
    const pdfBuffer = Buffer.from(data.file, "base64");
    const pdfData = await pdf(pdfBuffer);

    return new Response(JSON.stringify({ text: pdfData.text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PDF processing error:", error);
    return new Response(JSON.stringify({ error: "Failed to process PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
