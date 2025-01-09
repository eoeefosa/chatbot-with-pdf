// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getLangChainResponse } from "../../utils/langchain";

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body
    const body = await request.json();
    const { conversation } = body as { conversation: string };

    // Get response from LangChain
    const response = await getLangChainResponse(conversation);

    // Return the response
    return NextResponse.json({ response }, { status: 200 });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: `Failed to generate response  ${error.message}` },
      { status: 500 }
    );
  }
}
