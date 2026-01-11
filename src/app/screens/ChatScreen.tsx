import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { ChatBubble } from "../components/ChatBubble";
import { InputField } from "../components/InputField";
import { useMaterials } from "../context/MaterialsContext";

interface Message {
  id: number;
  text: string;
  type: "user" | "ai";
  timestamp: string;
}

export function ChatScreen() {
  const { materials } = useMaterials();
  const documentText = materials[0]?.content || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const timeNow = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: "ai",
        timestamp: timeNow(),
        text:
          "Hi 👋 I’m **Luna**, an AI study assistant.\n\n" +
          "I help explain Artificial Intelligence topics using your study material.",
      },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const answerFromDocument = (question: string) => {
    if (!documentText) {
      return "Please upload an AI document so I can help you study.";
    }

    const lowerDoc = documentText.toLowerCase();
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes("hi") || lowerQ.includes("hello")) {
      return "Hello 😊 I’m ready to help you study Artificial Intelligence.";
    }

    if (lowerDoc.includes("artificial intelligence") && lowerQ.includes("what")) {
      return "Artificial Intelligence is the field of computer science that focuses on creating systems capable of intelligent behavior, such as learning, reasoning, and problem-solving.";
    }

    if (lowerQ.includes("machine learning")) {
      return "Machine Learning is a subset of Artificial Intelligence that allows systems to learn from data and improve their performance without being explicitly programmed.";
    }

    if (lowerQ.includes("ai")) {
      return "Based on the document, Artificial Intelligence involves simulating human intelligence in machines to perform tasks like decision-making and learning.";
    }

    return "I couldn’t find a direct answer in the document, but you can ask about AI concepts like machine learning, intelligence, or applications.";
  };

  const send = () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    setMessages((m) => [
      ...m,
      {
        id: Date.now(),
        type: "user",
        text: userText,
        timestamp: timeNow(),
      },
      {
        id: Date.now() + 1,
        type: "ai",
        text: answerFromDocument(userText),
        timestamp: timeNow(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="px-4 pt-6 pb-3 border-b flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h1 className="font-bold">AI Study Chat</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            message={m.text}
            type={m.type}
            timestamp={m.timestamp}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <InputField
          value={input}
          onChange={setInput}
          onSubmit={send}
          placeholder="Ask about Artificial Intelligence..."
        />
        <button
          onClick={send}
          className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center"
        >
          <Send className="text-white" />
        </button>
      </div>
    </div>
  );
}
