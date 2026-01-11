import React, { useState, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { BackButton } from '../components/BackButton';
import { Upload, FileText, File as FileIcon, Trash2, CheckCircle2 } from 'lucide-react';
import { useMaterials } from '../context/MaterialsContext';
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FREE_DOCUMENTS = 10;

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 Bytes';
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

    const newMaterial = {
      id: Date.now(),
      name: file.name,
      type: file.type === 'application/pdf' ? 'pdf' : 'txt',
      date: 'Just now',
      size: formatFileSize(file.size),
      file,
      content: '',
      processed: true,
      processingError: null,
      usedOCR: false,
    };

    addMaterial(newMaterial);

    setShowSuccessModal(false);
    setUploadingFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadClick = () => fileInputRef.current?.click();

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
        <Card
          onClick={handleUploadClick}
          className="border-2 border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Upload New Material</h3>
              <p className="text-sm text-muted-foreground mt-1">
                PDF, TXT, DOC, DOCX files supported
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Click to browse files from your device
              </p>
            </div>
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

      <div className="px-6 mt-6">
        <h2 className="font-semibold mb-3">All Materials</h2>
        <div className="space-y-3">
          {materials.map((material) => (
            <Card key={material.id} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold truncate">{material.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {material.date} • {material.size}
                </p>
              </div>
              <button
                onClick={() => deleteMaterial(material.id)}
                className="w-10 h-10 rounded-full hover:bg-destructive/10 flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5 text-destructive" />
              </button>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={showSuccessModal} onClose={() => {}} title="Uploading...">
        <p className="text-center">{uploadingFileName}</p>
      </Modal>

      <Modal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Storage Limit Reached"
      >
        <p className="text-center">
          You reached the free plan limit.
        </p>
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
