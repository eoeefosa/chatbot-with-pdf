"use client";
import { useState } from "react";

interface ChatMessage {
  user: string;
  bot: string;
}

export default function Home() {
const [text, setText] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64 }),
      });
      const data = await res.json();
      setText(data.text);
    };
    reader.readAsDataURL(file);
  };

  const handleChat = async () => {
    if (!input.trim()) return;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation: text + "\n" + input }),
    });
    const data = await res.json();
    setChat([...chat, { user: input, bot: data.response }]);
    setInput("");
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
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
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
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-3"
          />
        </div>

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
                  <p className="text-gray-700">{c.bot}</p>
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
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          />
          <button
            onClick={handleChat}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
