import { NextApiRequest, NextApiResponse } from "next";
import pdf from "pdf-parse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { file } = req.body as { file: string }; // Type definition for incoming request
      const pdfBuffer = Buffer.from(file, "base64");
      const data = await pdf(pdfBuffer);
      res.status(200).json({ text: data.text });
    } catch (error) {
      res.status(500).json({ error: "Failed to parse PDF" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
