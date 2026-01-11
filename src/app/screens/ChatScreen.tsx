import React, { useState, useRef, useEffect } from "react";
import { ChatBubble } from "../components/ChatBubble";
import { InputField } from "../components/InputField";
import { BackButton } from "../components/BackButton";
import { Modal } from "../components/Modal";
import { Card } from "../components/Card";
import {
  Send,
  Sparkles,
  FileText,
  File as FileIcon,
  BookOpen,
  X,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import {
  useMaterials,
  UploadedMaterial,
} from "../context/MaterialsContext";

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
  const { user } = useUser();
  const { materials } = useMaterials();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hello${user?.name ? ` ${user.name}` : ""}! Select a study material and ask me anything.`,
      type: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [selectedMaterial, setSelectedMaterial] =
    useState<UploadedMaterial | null>(null);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ✅ AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: inputValue, type: "user", timestamp: now },
    ]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: selectedMaterial
            ? `I can answer based on "${selectedMaterial.name}".`
            : "Please select a study material first.",
          type: "ai",
          timestamp: now,
        },
      ]);
    }, 600);

    setInputValue("");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* ✅ SHORT HEADER */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-b-2xl relative">
        {onNavigate && (
          <div className="absolute top-6 left-6">
            <BackButton onBack={() => onNavigate("home")} />
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AI Study Chat</h1>
            <p className="text-xs text-muted-foreground">
              Answers from your materials only
            </p>
          </div>
        </div>

        {/* MATERIAL SELECTOR */}
        <button
          onClick={() => setShowMaterialSelector(true)}
          className="mt-3 w-full bg-card border border-border rounded-xl py-2 text-sm font-semibold flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          {selectedMaterial ? selectedMaterial.name : "Select Study Material"}
        </button>
      </div>

      {/* ✅ SCROLLABLE CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.text}
            type={msg.type}
            timestamp={msg.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="px-6 py-4 border-t bg-background">
        <div className="flex gap-2">
          <InputField
            value={inputValue}
            onChange={setInputValue}
            placeholder="Ask me anything..."
            onSubmit={handleSend}
          />
          <button
            onClick={handleSend}
            className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MATERIAL SELECT MODAL */}
      <Modal
        isOpen={showMaterialSelector}
        onClose={() => setShowMaterialSelector(false)}
        title="Select Study Material"
      >
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No materials uploaded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {materials.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMaterial(m);
                  setShowMaterialSelector(false);
                }}
                className="w-full flex items-center gap-3 border rounded-xl p-3"
              >
                {m.type === "pdf" ? (
                  <FileText className="w-5 h-5" />
                ) : (
                  <FileIcon className="w-5 h-5" />
                )}
                <span className="truncate">{m.name}</span>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
