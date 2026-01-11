import React, { useState, useRef, useEffect } from "react";
import { ChatBubble } from "../components/ChatBubble";
import { InputField } from "../components/InputField";
import { BackButton } from "../components/BackButton";
import { Modal } from "../components/Modal";
import { Sparkles, FileText, File as FileIcon, BookOpen, X, Send } from "lucide-react";
import { useMaterials, UploadedMaterial } from "../context/MaterialsContext";
import { useUser } from "../context/UserContext";

interface Message {
  id: number;
  text: string;
  type: "user" | "ai";
  timestamp: string;
  materialOptions?: UploadedMaterial[];
  isPromptToSelectMaterial?: boolean;
}

export function ChatScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const { materials } = useMaterials();
  const { user } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<UploadedMaterial | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: "ai",
        text: `Hello${user?.name ? ` ${user.name}` : ""}! Select a study material and ask me anything.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "user", text: inputValue, timestamp: time },
    ]);

    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "ai",
          text: selectedMaterial
            ? `Answering strictly from "${selectedMaterial.name}".`
            : "Please select a study material first.",
          timestamp: time,
        },
      ]);
      setIsTyping(false);
    }, 1000);

    setInputValue("");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-6 pt-12 pb-4 rounded-b-3xl relative">
        {onNavigate && (
          <div className="absolute top-12 left-6">
            <BackButton onBack={() => onNavigate("home")} />
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Study Chat</h1>
            <p className="text-sm text-muted-foreground">Answers from your materials only</p>
          </div>
        </div>

        {selectedMaterial ? (
          <div className="mt-4 bg-card/70 rounded-xl p-3 flex items-center gap-3">
            <FileText className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold truncate flex-1">{selectedMaterial.name}</p>
            <button onClick={() => setSelectedMaterial(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {}}
            className="mt-4 w-full bg-card/70 rounded-xl p-3"
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Select Study Material</span>
            </div>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            message={m.text}
            type={m.type}
            timestamp={m.timestamp}
          />
        ))}
        {isTyping && <p className="text-sm text-muted-foreground">Typing…</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 pb-6 pt-4 border-t flex gap-2">
        <InputField
          value={inputValue}
          onChange={setInputValue}
          placeholder="Ask me anything..."
          onSubmit={handleSend}
        />
        <button
          onClick={handleSend}
          className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
