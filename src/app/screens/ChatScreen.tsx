import React, { useState, useRef } from "react";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { BackButton } from "../components/BackButton";
import { Upload } from "lucide-react";
import { useMaterials } from "../context/MaterialsContext";
import { AISuggestEventModal } from "../components/AISuggestEventModal";
import { detectEventsFromText, DetectedEvent } from "../utils/eventDetection";
import { projectId, publicAnonKey } from "/utils/supabase/info";

/* =========================
   FILE → BASE64
========================= */
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (base64) resolve(base64);
      else reject("Failed to convert file");
    };
    reader.onerror = reject;
  });

export function ChatScreen({
  onNavigate,
}: {
  onNavigate?: (screen: string) => void;
}) {
  const { materials, addMaterial } = useMaterials();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState("");
  const [suggestedEvent, setSuggestedEvent] =
    useState<DetectedEvent | null>(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FREE_DOCUMENTS = 10;

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  /* =========================
     FILE UPLOAD HANDLER
  ========================= */
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (materials.length >= MAX_FREE_DOCUMENTS) {
      alert("Free plan limit reached");
      return;
    }

    try {
      setUploadingFileName(file.name);
      setShowSuccessModal(true);

      // 1️⃣ Convert to base64
      const base64Image = await fileToBase64(file);

      // 2️⃣ Send to Supabase OCR
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/document/ocr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ base64Image }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "OCR failed");
      }

      // 3️⃣ Save material
      addMaterial({
        id: Date.now(),
        name: file.name,
        type: "pdf",
        date: "Just now",
        size: formatFileSize(file.size),
        file,
        content: data.text || "",
        processed: Boolean(data.text),
        processingError: data.text ? null : "OCR returned no text",
        usedOCR: true,
      });

      // 4️⃣ Detect events
      const events = detectEventsFromText(data.text || "");
      if (events.length > 0) {
        setSuggestedEvent(events[0]);
        setShowSuggestModal(true);
      }
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setShowSuccessModal(false);
      setUploadingFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 px-6 pt-12 pb-6 rounded-b-3xl relative">
        {onNavigate && (
          <div className="absolute top-12 left-6">
            <BackButton onBack={() => onNavigate("home")} />
          </div>
        )}
        <h1 className="text-2xl font-bold">Study Materials</h1>
        <p className="text-muted-foreground mt-1">
          {materials.length} / {MAX_FREE_DOCUMENTS} files (Free Plan)
        </p>
      </div>

      <div className="px-6 mt-6">
        <Card
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed cursor-pointer"
        >
          <div className="flex flex-col items-center py-8 gap-3">
            <Upload className="w-8 h-8" />
            <p>Upload New Material</p>
          </div>
        </Card>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => {}}
        title="Processing File"
      >
        <p>{uploadingFileName}</p>
      </Modal>

      <AISuggestEventModal
        isOpen={showSuggestModal}
        suggestedEvent={suggestedEvent}
        onAccept={() => setShowSuggestModal(false)}
        onReject={() => setShowSuggestModal(false)}
      />
    </div>
  );
}
