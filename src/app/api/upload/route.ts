import { NextRequest, NextResponse } from "next/server";
import PDFParser from 'pdf2json';

interface RequestData {
file?: string;
}

interface PDFText {
R: Array<{ T: string }>;
}

interface PDFPage {
Texts: PDFText[];
}

interface PDFMetadata {
Creator?: string;
Producer?: string;
CreationDate?: string;
}

interface PDFData {
Pages: PDFPage[];
Meta?: PDFMetadata;
}

interface APIResponse {
text?: string;
pages?: number;
metadata?: {
    creator: string;
    producer: string;
    creationDate: string;
};
error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse>> {
  try {
    console.log("Received PDF upload request");

    const data = await request.json() as RequestData;

    // Validate incoming data
    if (!data?.file) {
      console.error("Missing file data in request");
      return NextResponse.json(
        { error: "No file data provided" },
        { status: 400 }
      );
    }

    if (typeof data.file !== 'string') {
      console.error("Invalid file data format");
      return NextResponse.json(
        { error: "Invalid file data format. Expected base64 string" },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = Buffer.from(data.file, "base64");
    } catch (error) {
      console.error("Base64 decoding error:", error);
      return NextResponse.json(
        { error: "Invalid base64 encoding" },
        { status: 400 }
      );
    }

    // Parse PDF using pdf2json
    const pdfParser = new PDFParser();

    try {
      const pdfData = await new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
          resolve(pdfData);
        });

        pdfParser.on("pdfParser_dataError", (error) => {
          reject(error);
        });

        pdfParser.parseBuffer(pdfBuffer);
      });

      // Extract text from the parsed data
    const text = (pdfData as PDFData).Pages
    .map((page: PDFPage) => {
        return page.Texts
        .map((textItem: PDFText) => decodeURIComponent(textItem.R[0].T))
        .join(' ');
    })
    .join('\n\n');

      if (!text) {
        return NextResponse.json(
          { error: "No text content found in PDF" },
          { status: 422 }
        );
      }

      return NextResponse.json(
        {
        text: text,
        pages: (pdfData as PDFData).Pages.length,
        metadata: {
        creator: (pdfData as PDFData).Meta?.Creator || '',
        producer: (pdfData as PDFData).Meta?.Producer || '',
        creationDate: (pdfData as PDFData).Meta?.CreationDate || ''
          }
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("PDF parsing error:", error);
      return NextResponse.json(
        { error: "Failed to parse PDF file. Please ensure the file is a valid PDF." },
        { status: 422 }
      );
    }
  } catch (error: unknown) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}