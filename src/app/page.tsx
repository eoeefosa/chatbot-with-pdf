"use client";
import { useState } from "react";
import { createWorker } from 'tesseract.js';
import { pdfjs } from 'pdf-js';
interface ChatMessage {
  user: string;
  bot: string;
}

export default function Home() {
  const [text, setText] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      if (file.type !== "application/pdf") {
        throw new Error("Please upload a PDF file");
      }

      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const base64 = e.target?.result?.toString().split(",")[1];
          if (base64) {
            resolve(base64);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file: fileData }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload PDF");
      }

      const data = await res.json();
      setText(data.text);
      setChat([]); // Clear previous chat when new PDF is uploaded
    } catch (error) {
      console.error("File upload error:", error);
      setError(error instanceof Error ? error.message : "Failed to upload PDF");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChat = async () => {
    if (!input.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: text + "\n" + input }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await res.json();
      setChat([...chat, { user: input, bot: data.response }]);
      setInput("");
      setError(null);
    } catch (error) {
      console.error("Chat error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to get response"
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Chat with Your PDF
        </h1>

        {/* File Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            accept="application/pdf"
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50"
          />
          {isUploading && (
            <p className="mt-2 text-sm text-blue-600">Uploading PDF...</p>
          )}
        </div>

        {/* PDF Content Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF Content
          </label>
          <textarea
            value={text}
            readOnly
            rows={5}
            className="w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 
                     bg-white p-3"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Chat Messages */}
        <div className="mb-6 space-y-4">
          {chat.map((c, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-start">
                <div className="bg-blue-50 rounded-lg px-4 py-2 max-w-[80%]">
                  <p className="text-sm font-medium text-gray-900">You</p>
                  <p className="text-gray-700">{c.user}</p>
                </div>
              </div>
              <div className="flex items-start justify-end">
                <div className="bg-white rounded-lg px-4 py-2 max-w-[80%] shadow-sm">
                  <p className="text-sm font-medium text-gray-900">Bot</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{c.bot}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="flex space-x-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={!text || isSending}
            className="flex-1 rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 p-2
                     disabled:opacity-50 disabled:bg-gray-100"
          />
          <button
            onClick={handleChat}
            disabled={!text || !input.trim() || isSending}
            className="inline-flex items-center px-4 py-2 border border-transparent 
                     text-sm font-medium rounded-md shadow-sm text-white 
                     bg-blue-600 hover:bg-blue-700 focus:outline-none 
                     focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:bg-blue-400"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
