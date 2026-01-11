import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, FileText, X } from "lucide-react";
import { BackButton } from "../components/BackButton";
import { InputField } from "../components/InputField";
import { ChatBubble } from "../components/ChatBubble";
import { Modal } from "../components/Modal";
import { useMaterials, UploadedMaterial } from "../context/MaterialsContext";

interface Message {
  id: number;
  text: string;
  type: "user" | "ai";
  timestamp: string;
}

export function ChatScreen({
  onNavigate,
}: {
  onNavigate?: (screen: string) => void;
}) {
  const { materials } = useMaterials();
  const [selectedMaterial, setSelectedMaterial] =
    useState<UploadedMaterial | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* =========================
     INITIAL MESSAGE
  ========================= */
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! Select a study material and ask me anything.",
        type: "ai",
        timestamp: timeNow(),
      },
    ]);
  }, []);

  const timeNow = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  /* =========================
     SEND MESSAGE
  ========================= */
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      type: "user",
      timestamp: timeNow(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    if (!selectedMaterial) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Please select a study material first.",
          type: "ai",
          timestamp: timeNow(),
        },
      ]);
      return;
    }

    setIsTyping(true);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
You are a strict study assistant.

RULES:
- Answer ONLY using the document text below.
- If the answer is NOT in the document, say:
"I cannot find this information in the document."
- Do NOT use external knowledge.

DOCUMENT:
${selectedMaterial.content}
              `,
            },
            {
              role: "user",
              content: userMessage.text,
            },
          ],
        }),
      });

      const data = await response.json();
      const aiText =
        data.choices?.[0]?.message?.content ||
        "I cannot find this information in the document.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: aiText,
          type: "ai",
          timestamp: timeNow(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Something went wrong while answering.",
          type: "ai",
          timestamp: timeNow(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* HEADER (SHORT) */}
      <div className="px-4 pt-6 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <BackButton onBack={() => onNavigate("home")} />
          )}
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <h1 className="font-bold">AI Study Chat</h1>
              <p className="text-xs text-muted-foreground">
                Answers from your materials only
              </p>
            </div>
          </div>
        </div>

        {/* SELECTED MATERIAL */}
        {selectedMaterial ? (
          <div className="mt-3 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm truncate flex-1">
              {selectedMaterial.name}
            </span>
            <button onClick={() => setSelectedMaterial(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowMaterialSelector(true)}
            className="mt-3 w-full bg-muted rounded-lg py-2 text-sm"
          >
            Select Study Material
          </button>
        )}
      </div>

      {/* MESSAGES (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.text}
            type={msg.type}
            timestamp={msg.timestamp}
          />
        ))}

        {isTyping && (
          <ChatBubble
            message="Typing..."
            type="ai"
            timestamp={timeNow()}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT (ABOVE BOTTOM NAV) */}
      <div className="px-4 pb-28 pt-3 border-t border-border bg-background">
        <div className="flex gap-2">
          <InputField
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSend}
            placeholder="Ask me anything..."
          />
          <button
            onClick={handleSend}
            className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* MATERIAL SELECTOR */}
      <Modal
        isOpen={showMaterialSelector}
        onClose={() => setShowMaterialSelector(false)}
        title="Select Study Material"
      >
        <div className="space-y-2">
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMaterial(m);
                setShowMaterialSelector(false);
              }}
              className="w-full text-left p-3 rounded-lg border hover:bg-muted"
            >
              {m.name}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
