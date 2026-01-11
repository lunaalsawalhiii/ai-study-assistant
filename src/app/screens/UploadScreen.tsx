import React, { useState, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { BackButton } from '../components/BackButton';
import { Upload, FileText, File as FileIcon, Trash2, CheckCircle2 } from 'lucide-react';
import { useMaterials } from '../context/MaterialsContext';
import { AISuggestEventModal } from '../components/AISuggestEventModal';
import { detectEventsFromText, DetectedEvent } from '../utils/eventDetection';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useUser } from '../context/UserContext';

/* =========================
   FILE → BASE64 (ONCE)
========================= */
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (base64) resolve(base64);
      else reject('Failed to convert file');
    };
    reader.onerror = reject;
  });

export function UploadScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const { materials, addMaterial, deleteMaterial } = useMaterials();
  const { user, isDemoMode } = useUser();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState('');
  const [suggestedEvent, setSuggestedEvent] = useState<DetectedEvent | null>(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [pendingSuggestions, setPendingSuggestions] = useState<DetectedEvent[]>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FREE_DOCUMENTS = 10;

  const formatFileSize = (bytes: number): string => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  /* =========================
     FILE UPLOAD HANDLER
  ========================= */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (materials.length >= MAX_FREE_DOCUMENTS) {
      setShowLimitModal(true);
      return;
    }

    const validTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!validTypes.includes(file.type)) {
      alert('Only PDF, TXT, DOC, and DOCX files are supported');
      return;
    }

    try {
      setUploadingFileName(file.name);
      setShowSuccessModal(true);

      // 1️⃣ Convert to base64
      const base64Image = await fileToBase64(file);

      // 2️⃣ Send to OCR backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/document/ocr`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ base64Image }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'OCR failed');

      const processed = {
        text: data.text,
        usedOCR: true,
      };

      // 3️⃣ Save material
      addMaterial({
        id: Date.now(),
        name: file.name,
        type: file.type === 'application/pdf' ? 'pdf' : 'txt',
        date: 'Just now',
        size: formatFileSize(file.size),
        file,
        content: processed.text,
        processed: true,
        processingError: null,
        usedOCR: processed.usedOCR,
      });

      // 4️⃣ Detect events
      const detectedEvents = detectEventsFromText(processed.text);
      if (detectedEvents.length > 0) {
        setPendingSuggestions(detectedEvents);
        setCurrentSuggestionIndex(0);
        setSuggestedEvent(detectedEvents[0]);
        setShowSuggestModal(true);
      }
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setShowSuccessModal(false);
      setUploadingFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 px-6 pt-12 pb-6 rounded-b-3xl relative">
        {onNavigate && (
          <div className="absolute top-12 left-6">
            <BackButton onBack={() => onNavigate('home')} />
          </div>
        )}
        <h1 className="text-2xl font-bold">Study Materials</h1>
        <p className="text-muted-foreground mt-1">
          {materials.length} / {MAX_FREE_DOCUMENTS} files (Free Plan)
        </p>
      </div>

      <div className="px-6 mt-6">
        <Card onClick={handleUploadClick} className="border-2 border-dashed cursor-pointer">
          <div className="flex flex-col items-center py-8 gap-3">
            <Upload className="w-8 h-8" />
            <p>Upload New Material</p>
          </div>
        </Card>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.txt,.doc,.docx"
          className="hidden"
        />
      </div>

      <Modal isOpen={showSuccessModal} onClose={() => {}} title="Processing File">
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
