import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

const chat = new ChatGoogleGenerativeAI({
  modelName: "gemini-pro",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY as string,
});

// Create a prompt template
const prompt = PromptTemplate.fromTemplate(`
  {context}
  Human: {text}
  Assistant: Let me help you with that.
`);

export const getLangChainResponse = async (
  conversation: string
): Promise<string> => {
  const memory = new BufferMemory({
    returnMessages: true,
    inputKey: "text",
    outputKey: "response",
  });

  // Create a chain using RunnableSequence
  const chain = RunnableSequence.from([
    {
      context: async () => {
        const memoryResult = await memory.loadMemoryVariables({});
        return memoryResult.history || "";
      },
      text: (input: { text: string }) => input.text,
    },
    prompt,
    chat,
  ]);

  // Run the chain
  const response = await chain.invoke({ text: conversation });

  // Save the interaction to memory
  await memory.saveContext(
    { text: conversation },
    { response: response.content }
  );

  return response.content as string;
};
