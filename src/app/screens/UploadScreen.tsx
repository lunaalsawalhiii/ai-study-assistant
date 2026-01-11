import React, { useState, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { BackButton } from '../components/BackButton';
import { Upload, FileText, File as FileIcon, Trash2, CheckCircle2 } from 'lucide-react';
import { useMaterials } from '../context/MaterialsContext';
import { processDocument } from '../utils/documentProcessor';
import { AISuggestEventModal } from '../components/AISuggestEventModal';
import { detectEventsFromText, DetectedEvent } from '../utils/eventDetection';
import { useUser } from '../context/UserContext';

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (materials.length >= MAX_FREE_DOCUMENTS) {
      setShowLimitModal(true);
      return;
    }

    setUploadingFileName(file.name);
    setShowSuccessModal(true);

    const processed = await processDocument(file);

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
      usedOCR: false,
    });

    setShowSuccessModal(false);
    setUploadingFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    const detectedEvents = detectEventsFromText(processed.text);
    if (detectedEvents.length > 0) {
      setPendingSuggestions(detectedEvents);
      setCurrentSuggestionIndex(0);
      setSuggestedEvent(detectedEvents[0]);
      setShowSuggestModal(true);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 px-6 pt-12 pb-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold">Study Materials</h1>
        <p className="text-muted-foreground mt-1">
          {materials.length} / {MAX_FREE_DOCUMENTS} files (Free Plan)
        </p>
      </div>

      <div className="px-6 mt-6">
        <Card onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed cursor-pointer">
          <div className="flex flex-col items-center py-8 gap-3">
            <Upload className="w-8 h-8" />
            <p>Upload New Material</p>
          </div>
        </Card>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
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
        onReject=
