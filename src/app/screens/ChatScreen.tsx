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
import { projectId, publicAnonKey } from "/utils/supabase/info";

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
  const { user, isDemoMode } = useUser();
  const { materials } = useMaterials();
  const [selectedMaterial, setSelectedMaterial] =
    useState<UploadedMaterial | null>(null);
  const [showMaterialSelector, setShowMaterialSelector] =
    useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history when component mounts or material changes
  useEffect(() => {
    loadChatHistory();
  }, [selectedMaterial, user, isDemoMode]);

  const loadChatHistory = async () => {
    setIsLoading(true);
    const materialId = selectedMaterial?.id || "general";

    if (isDemoMode) {
      // Demo mode: Use localStorage
      const storageKey = `chat_history_demo_${materialId}`;
      const savedMessages = localStorage.getItem(storageKey);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Set initial greeting message
        setMessages(getGreetingMessage());
      }
    } else if (user) {
      // Real user: Load from database
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/chat/messages/${materialId}`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          } else {
            setMessages(getGreetingMessage());
          }
        } else {
          setMessages(getGreetingMessage());
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        setMessages(getGreetingMessage());
      }
    } else {
      setMessages(getGreetingMessage());
    }

    setIsLoading(false);
  };

  const getGreetingMessage = (): Message[] => {
    return [
      {
        id: 1,
        text: `Hello${user?.name ? ` ${user.name}` : ""}! I'm Lunar, your trusted study partner. I only provide answers based on your uploaded study materials - no external information, no guessing. Ask me anything about the materials you've uploaded!`,
        type: "ai",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      },
    ];
  };

  // Save messages whenever they change
  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    saveChatHistory();
  }, [messages]);

  const saveChatHistory = async () => {
    const materialId = selectedMaterial?.id || "general";

    if (isDemoMode) {
      // Demo mode: Save to localStorage
      const storageKey = `chat_history_demo_${materialId}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify(messages),
      );
    } else if (user) {
      // Real user: Save to database
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/chat/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: messages[messages.length - 1], // Save only the latest message
              materialId: materialId,
            }),
          },
        );
      } catch (error) {
        console.error("Error saving chat message:", error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = (
    userMessage: string,
    material: UploadedMaterial,
  ) => {
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse = "";
      const materialName = material.name;

      // Check if document was processed successfully
      if (!material.processed || !material.content) {
        // Document couldn't be read
        aiResponse = `I couldn't read the text from "${materialName}". ${material.processingError || "This may be a scanned or image-based PDF."}\n\nFor accurate answers, please upload a text-based PDF or TXT file where the text can be selected and copied.`;
      } else {
        // Document was successfully processed - answer ONLY from its content
        const documentContent = material.content;
        const lowerContent = documentContent.toLowerCase();
        const lowerMessage = userMessage.toLowerCase();

        // Find relevant information in the document
        const excerpts = extractRelevantExcerpts(
          documentContent,
          lowerMessage,
          3,
        );

        if (excerpts.length > 0) {
          // Found relevant content - provide answer from the document
          aiResponse = `Based on "${materialName}":\n\n`;

          // Handle different types of questions
          if (
            lowerMessage.includes("summary") ||
            lowerMessage.includes("summarize") ||
            lowerMessage.includes("overview")
          ) {
            // Provide summary
            const summary = getSummary(documentContent);
            aiResponse += `${summary}\n\nWhat specific aspect would you like to explore further?`;
          } else if (
            lowerMessage.includes("what is") ||
            lowerMessage.includes("what are") ||
            lowerMessage.includes("define")
          ) {
            // Provide definition/explanation
            aiResponse += `${excerpts.join("\n\n")}\n\nWould you like me to explain this in more detail?`;
          } else if (
            lowerMessage.includes("how") ||
            lowerMessage.includes("why") ||
            lowerMessage.includes("explain")
          ) {
            // Provide explanation
            aiResponse += `Here's what the document says:\n\n${excerpts.join("\n\n")}\n\nDoes this help answer your question?`;
          } else if (
            lowerMessage.includes("list") ||
            lowerMessage.includes("examples")
          ) {
            // Provide list or examples
            aiResponse += `${excerpts.join("\n\n")}\n\nWould you like more details on any of these?`;
          } else {
            // General answer
            aiResponse += `${excerpts.join("\n\n")}\n\nIs there anything else you'd like to know about this topic?`;
          }
        } else {
          // No relevant content found - strict response
          aiResponse = `I can't find this information in the uploaded document.\n\nThe document "${materialName}" doesn't seem to contain information about "${userMessage}". Try asking about topics that are covered in this specific study material.`;
        }
      }

      const currentTime = new Date().toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        },
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: aiResponse,
          type: "ai",
          timestamp: currentTime,
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  // Helper function to get a summary from the document
  const getSummary = (content: string): string => {
    // Get first meaningful paragraphs (up to 400 characters)
    const paragraphs = content
      .split("\n\n")
      .filter((p) => p.trim().length > 50);
    let summary = "";

    for (const para of paragraphs) {
      if (summary.length + para.length < 400) {
        summary += para.trim() + "\n\n";
      } else {
        break;
      }
    }

    return (
      summary.trim() || content.substring(0, 400).trim() + "..."
    );
  };

  // Helper function to extract relevant excerpts from document
  const extractRelevantExcerpts = (
    content: string,
    query: string,
    maxExcerpts: number = 3,
  ): string[] => {
    // Split into sentences
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);

    // Extract meaningful query words (ignore common words)
    const commonWords = [
      "the",
      "is",
      "are",
      "was",
      "were",
      "what",
      "how",
      "why",
      "can",
      "could",
      "would",
      "should",
      "tell",
      "me",
      "about",
    ];
    const queryWords = query
      .toLowerCase()
      .split(" ")
      .filter(
        (word) =>
          word.length > 3 && !commonWords.includes(word),
      );

    if (queryWords.length === 0) {
      // No meaningful query words - return first few sentences
      return sentences
        .slice(0, maxExcerpts)
        .map((s) => s.trim());
    }

    // Score each sentence based on query word matches
    const scoredSentences = sentences.map((sentence) => {
      const lowerSentence = sentence.toLowerCase();
      let score = 0;

      queryWords.forEach((word) => {
        // Count occurrences of each query word
        const regex = new RegExp(word, "gi");
        const matches = lowerSentence.match(regex);
        score += matches ? matches.length * 2 : 0;

        // Bonus for exact phrase match
        if (lowerSentence.includes(query.toLowerCase())) {
          score += 10;
        }
      });

      return { sentence: sentence.trim(), score };
    });

    // Get top scoring sentences
    const relevantSentences = scoredSentences
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxExcerpts)
      .map((s) => s.sentence);

    return relevantSentences;
  };

  const handleMaterialSelect = (material: UploadedMaterial) => {
    setSelectedMaterial(material);
    setShowMaterialSelector(false);

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // If there's a pending question, process it with the selected material
    if (pendingQuestion) {
      simulateAIResponse(pendingQuestion, material);
      setPendingQuestion(null);
    } else {
      // Just confirm the selection
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `Great! I'm now ready to answer questions from "${material.name}". What would you like to know?`,
          type: "ai",
          timestamp: currentTime,
        },
      ]);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      type: "user" as const,
      timestamp: currentTime,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Check if user has selected a material
    if (!selectedMaterial) {
      // Prompt user to select a material
      setPendingQuestion(inputValue);
      setIsTyping(true);
      setTimeout(() => {
        const promptMessage: Message = {
          id: Date.now(),
          text: `Sure! Which study material would you like me to answer from?`,
          type: "ai",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          materialOptions: materials,
          isPromptToSelectMaterial: true,
        };
        setMessages((prev) => [...prev, promptMessage]);
        setIsTyping(false);
      }, 800);
    } else {
      // Answer based on selected material
      simulateAIResponse(inputValue, selectedMaterial);
    }

    setInputValue("");
  };

  const quickPrompts = [
    "Explain derivatives",
    "French Revolution summary",
    "How does photosynthesis work?",
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-6 pt-12 pb-4 flex-shrink-0 rounded-b-3xl relative">
        {onNavigate && (
          <div className="absolute top-12 left-6">
            <BackButton onBack={() => onNavigate("home")} />
          </div>
        )}
        <div
          className={`flex items-center gap-3 ${onNavigate ? "pt-12" : ""}`}
        >
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

        {/* Selected Material or Material Selector Button */}
        {selectedMaterial ? (
          <div className="mt-4 bg-card/70 backdrop-blur-sm border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  Current material:
                </p>
                <p className="text-sm font-semibold truncate">
                  {selectedMaterial.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMaterial(null)}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center flex-shrink-0 transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowMaterialSelector(true)}
            className="mt-4 w-full bg-card/70 backdrop-blur-sm border border-border rounded-xl p-3 hover:bg-card transition-colors"
          >
            <div className="flex items-center gap-3 justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">
                Select Study Material
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.map((message) => (
          <div key={message.id}>
            <ChatBubble
              message={message.text}
              type={message.type}
              timestamp={message.timestamp}
            />
            {/* Show material selection options inline if the message prompts for it */}
            {message.isPromptToSelectMaterial &&
              message.materialOptions && (
                <div className="mb-4 space-y-2 mt-2">
                  {message.materialOptions.map((material) => (
                    <button
                      key={material.id}
                      onClick={() =>
                        handleMaterialSelect(material)
                      }
                      className="w-full bg-card border border-border rounded-xl p-3 hover:bg-muted/50 transition-colors flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        {material.type === "pdf" ? (
                          <FileText className="w-5 h-5 text-primary" />
                        ) : (
                          <FileIcon className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {material.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {material.size}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-2">
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-6 pb-2 flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-2">
            Quick prompts:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInputValue(prompt)}
                className="px-4 py-2 bg-card border border-border rounded-full text-sm whitespace-nowrap hover:bg-muted/50 transition-colors flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-24 pt-4 flex-shrink-0 bg-background border-t border-border">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <InputField
              value={inputValue}
              onChange={setInputValue}
              placeholder="Ask me anything..."
              onSubmit={handleSend}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
              inputValue.trim()
                ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Material Selector Modal */}
      <Modal
        isOpen={showMaterialSelector}
        onClose={() => setShowMaterialSelector(false)}
        title="Select Study Material"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Choose which document you'd like me to answer
            questions from:
          </p>
          {materials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No study materials uploaded yet.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Upload materials to start asking questions!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {materials.map((material) => (
                <button
                  key={material.id}
                  onClick={() => handleMaterialSelect(material)}
                  className="w-full bg-card border border-border rounded-xl p-3 hover:bg-muted/50 transition-colors flex items-center gap-3 text-left"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {material.type === "pdf" ? (
                      <FileText className="w-6 h-6 text-primary" />
                    ) : (
                      <FileIcon className="w-6 h-6 text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {material.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {material.size} • {material.date}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}