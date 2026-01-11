import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, FileText, BookOpen, X } from "lucide-react";
import { BackButton } from "../components/BackButton";
import { Modal } from "../components/Modal";
import { InputField } from "../components/InputField";
import { ChatBubble } from "../components/ChatBubble";
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

export function ChatScreen({
  onNavigate,
}: {
  onNavigate?: (screen: string) => void;
}) {
  const { materials } = useMaterials();
  const { user } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<UploadedMaterial | null>(null);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const time = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  /* =========================
     INITIAL MESSAGE
  ========================= */
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        text: `Hello${user?.name ? ` ${user.name}` : ""}!  
Select a study material and ask me anything.`,
        type: "ai",
        timestamp: time(),
      },
    ]);
  }, []);

  /* =========================
     AUTO SCROLL (FIXED)
  ========================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* =========================
     SEND MESSAGE
  ========================= */
  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: inputValue,
      type: "user",
      timestamp: time(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    if (!selectedMaterial) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "Please select a study material first.",
            type: "ai",
            timestamp: time(),
            materialOptions: materials,
            isPromptToSelectMaterial: true,
          },
        ]);
        setIsTyping(false);
      }, 500);
      return;
    }

    answerFromDocument(userMsg.text, selectedMaterial);
  };

  /* =========================
     ANSWER FROM DOCUMENT ONLY
  ========================= */
  const answerFromDocument = (
    question: string,
    material: UploadedMaterial
  ) => {
    setIsTyping(true);

    setTimeout(() => {
      let reply = "";

      if (!material.content) {
        reply = `I couldn't read the text from "${material.name}".`;
      } else if (
        !material.content
          .toLowerCase()
          .includes(question.toLowerCase().split(" ")[0])
      ) {
        reply = `I can’t find this information in "${material.name}".`;
      } else {
        reply = `From "${material.name}":\n\n${material.content
          .split("\n")
          .slice(0, 4)
          .join("\n")}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: reply,
          type: "ai",
          timestamp: time(),
        },
      ]);

      setIsTyping(false);
    }, 800);
  };

  /* =========================
     SELECT MATERIAL
  ========================= */
  const handleMaterialSelect = (material: UploadedMaterial) => {
    setSelectedMaterial(material);
    setShowMaterialSelector(false);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: `Now answering from "${material.name}".`,
        type: "ai",
        timestamp: time(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-6 pt-12 pb-4 rounded-b-3xl relative">
        {onNavigate && (
          <div className="absolute top-12 left-6">
            <BackButton onBack={() => onNavigate("home")} />
          </div>
        )}

        <div className="flex items-center gap-3 pt-12">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Study Chat</h1>
            <p className="text-sm text-muted-foreground">
              Answers from your materials only
            </p>
          </div>
        </div>

        {selectedMaterial ? (
          <div className="mt-4 bg-card border rounded-xl p-3 flex items-center gap-3">
            <FileText className="w-4 h-4 text-primary" />
            <p className="flex-1 text-sm font-semibold truncate">
              {selectedMaterial.name}
            </p>
            <button onClick={() => setSelectedMaterial(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowMaterialSelector(true)}
            className="mt-4 w-full bg-card border rounded-xl p-3"
          >
            <BookOpen className="inline w-4 h-4 mr-2 text-primary" />
            Select Study Material
          </button>
        )}
      </div>

      {/* MESSAGES — SCROLL WORKS HERE */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            message={m.text}
            type={m.type}
            timestamp={m.timestamp}
          />
        ))}

        {isTyping && (
          <ChatBubble
            message="Typing..."
            type="ai"
            timestamp={time()}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="px-6 py-4 border-t bg-background">
        <div className="flex gap-2">
          <InputField
            value={inputValue}
            onChange={setInputValue}
            placeholder="Ask me anything…"
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

      {/* MATERIAL MODAL */}
      <Modal
        isOpen={showMaterialSelector}
        onClose={() => setShowMaterialSelector(false)}
        title="Select Study Material"
      >
        {materials.map((m) => (
          <button
            key={m.id}
            onClick={() => handleMaterialSelect(m)}
            className="w-full border rounded-xl p-3 mb-2 text-left"
          >
            {m.name}
          </button>
        ))}
      </Modal>
    </div>
  );
}
