import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, FileText, X } from "lucide-react";
import { ChatBubble } from "../components/ChatBubble";
import { InputField } from "../components/InputField";
import { Modal } from "../components/Modal";
import { useMaterials, UploadedMaterial } from "../context/MaterialsContext";

interface Message {
  id: number;
  text: string;
  type: "user" | "ai";
  timestamp: string;
}

export function ChatScreen() {
  const { materials } = useMaterials();
  const [selectedMaterial, setSelectedMaterial] =
    useState<UploadedMaterial | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showSelector, setShowSelector] = useState(false);

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
          "Hi 👋 I’m **Luna**, your AI study assistant.\n\n" +
          "You can talk to me like ChatGPT.\n\n" +
          "📄 Please select a study document so I can answer from it.",
      },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const answer = (q: string) => {
    if (!selectedMaterial) {
      return "Please select a document first 📄";
    }

    const doc = selectedMaterial.content.toLowerCase();
    const question = q.toLowerCase();

    if (question.includes("hi") || question.includes("hello")) {
      return "Hello 😊 I’m ready to help you study.";
    }

    if (doc.includes("artificial intelligence") && question.includes("what")) {
      return "Artificial Intelligence is the field of creating machines that can perform tasks requiring human intelligence.";
    }

    if (question.includes("machine learning")) {
      return "Machine Learning is a branch of AI that allows systems to learn from data and improve automatically.";
    }

    if (question.includes("ai")) {
      return "Based on the document, AI focuses on intelligent behavior such as learning, reasoning, and decision-making.";
    }

    return "I couldn’t find this information in the selected document.";
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
        text: answer(userText),
        timestamp: timeNow(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* HEADER */}
      <div className="px-4 pt-6 pb-3 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          <h1 className="font-bold">AI Study Chat</h1>
        </div>

        {selectedMaterial ? (
          <div className="mt-3 flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
            <FileText className="w-4 h-4" />
            <span className="flex-1 truncate text-sm">
              {selectedMaterial.name}
            </span>
            <button onClick={() => setSelectedMaterial(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSelector(true)}
            className="mt-3 w-full bg-muted py-2 rounded-lg text-sm"
          >
            Select Study Document
          </button>
        )}
      </div>

      {/* MESSAGES (SCROLLABLE) */}
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

      {/* INPUT */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <InputField
            value={input}
            onChange={setInput}
            onSubmit={send}
            placeholder="Ask about AI..."
          />
          <button
            onClick={send}
            className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center"
          >
            <Send className="text-white" />
          </button>
        </div>
      </div>

      {/* DOCUMENT SELECTOR */}
      <Modal
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        title="Choose a document"
      >
        <div className="space-y-2">
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMaterial(m);
                setShowSelector(false);
              }}
              className="w-full text-left p-3 border rounded-lg hover:bg-muted"
            >
              {m.name}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
