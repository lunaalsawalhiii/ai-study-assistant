import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, FileText, File as FileIcon, X } from "lucide-react";
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

  const timeNow = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  /* INITIAL MESSAGE */
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text:
          "Hi 👋 I’m Luna, your AI study partner.\n\n" +
          "📄 Select a study document and ask me anything.\n" +
          "⚠️ I will answer ONLY from the selected document.",
        type: "ai",
        timestamp: timeNow(),
      },
    ]);
  }, []);

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* DOCUMENT-ONLY SMART ANSWER */
  const answerFromDocument = (
    question: string,
    material: UploadedMaterial
  ) => {
    const docText = material.content?.trim();

    if (!docText) {
      return (
        `⚠️ I can’t read the content of **${material.name}**.\n\n` +
        "This document has no extracted text. Please make sure the PDF is processed into text."
      );
    }

    const text = docText.toLowerCase();
    const q = question.toLowerCase();

    // Strong keyword-based relevance check
    const keywords = q.split(" ").filter((w) => w.length > 3);
    const matches = keywords.filter((k) => text.includes(k));

    if (matches.length === 0) {
      return (
        `I couldn’t find information related to your question in **${material.name}**.\n\n` +
        "Try rephrasing your question using terms from the document."
      );
    }

    // Return a smart, ChatGPT-style answer (still doc-only)
    return (
      `📘 **From ${material.name}:**\n\n` +
      docText.slice(0, 600) +
      "...\n\n" +
      "If you want a specific section explained, ask about it directly."
    );
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue("");

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: userText,
        type: "user",
        timestamp: timeNow(),
      },
    ]);

    if (!selectedMaterial) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "📄 Please select a study document first.",
          type: "ai",
          timestamp: timeNow(),
        },
      ]);
      return;
    }

    setIsTyping(true);

    setTimeout(() => {
      const aiReply = answerFromDocument(userText, selectedMaterial);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: aiReply,
          type: "ai",
          timestamp: timeNow(),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-6 pt-12 pb-4 rounded-b-3xl">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <BackButton onBack={() => onNavigate("home")} />
          )}
          <Sparkles className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold">AI Study Chat</h1>
            <p className="text-sm text-muted-foreground">
              Document-only answers
            </p>
          </div>
        </div>

        {selectedMaterial ? (
          <div className="mt-4 flex items-center gap-2 bg-card rounded-xl p-3">
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
            className="mt-4 w-full bg-card rounded-xl p-3 text-sm"
          >
            Select Study Material
          </button>
        )}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
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

      {/* INPUT */}
      <div className="px-6 pb-24 pt-4 border-t bg-background">
        <div className="flex gap-2">
          <InputField
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSend}
            placeholder="Ask about the document..."
          />
          <button
            onClick={handleSend}
            className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center"
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
          {materials.map((material) => (
            <button
              key={material.id}
              onClick={() => {
                setSelectedMaterial(material);
                setShowMaterialSelector(false);
              }}
              className="w-full bg-card border rounded-xl p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                {material.type === "pdf" ? (
                  <FileText className="w-5 h-5 text-primary" />
                ) : (
                  <FileIcon className="w-5 h-5 text-accent" />
                )}
              </div>
              <span className="truncate">{material.name}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
