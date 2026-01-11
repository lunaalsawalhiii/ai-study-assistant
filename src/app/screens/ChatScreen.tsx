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

export function ChatScreen({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const { materials } = useMaterials();
  const [selectedMaterial, setSelectedMaterial] =
    useState<UploadedMaterial | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          "Hello! 👋 I'm **Luna**, your AI study partner.\n\n" +
          "I can chat with you and help you study.\n\n" +
          "📄 First, please select a study material so I can answer from it.",
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue("");

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        text: userText,
        timestamp: timeNow(),
      },
    ]);

    setIsTyping(true);

    try {
      let systemPrompt = "";
      let userPrompt = userText;

      // 🟦 MODE 1 — NO DOCUMENT SELECTED
      if (!selectedMaterial) {
        systemPrompt = `
You are Luna, a friendly AI study assistant.

You can:
- Greet the user
- Explain what you can do
- Ask them to select a document
- Chat normally like ChatGPT

If they ask study questions, politely ask them to select a document first.
`;
      }

      // 🟩 MODE 2 — DOCUMENT SELECTED
      else {
        systemPrompt = `
You are Luna, a STRICT study assistant.

RULES:
- Answer ONLY using the document below.
- If the answer is NOT in the document, say:
"I cannot find this information in the document."
- Do NOT use external knowledge.
- Be clear and helpful.

DOCUMENT:
${selectedMaterial.content}
`;
      }

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      const data = await res.json();
      const aiText =
        data.choices?.[0]?.message?.content ??
        "Sorry, something went wrong.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "ai",
          text: aiText,
          timestamp: timeNow(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "ai",
          text: "Something went wrong while answering.",
          timestamp: timeNow(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* HEADER */}
      <div className="px-4 pt-6 pb-3 border-b">
        <div className="flex items-center gap-3">
          {onNavigate && <BackButton onBack={() => onNavigate("home")} />}
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <h1 className="font-bold">AI Chat</h1>
            <p className="text-xs text-muted-foreground">
              Smart chat • Study-safe answers
            </p>
          </div>
        </div>

        {selectedMaterial ? (
          <div className="mt-3 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <FileText className="w-4 h-4" />
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

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            message={m.text}
            type={m.type}
            timestamp={m.timestamp}
          />
        ))}
        {isTyping && (
          <ChatBubble message="Typing…" type="ai" timestamp={timeNow()} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="px-4 pb-28 pt-3 border-t">
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
