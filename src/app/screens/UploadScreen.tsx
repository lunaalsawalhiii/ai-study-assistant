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
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useUser } from '../context/UserContext';

export function UploadScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const { materials, addMaterial, deleteMaterial } = useMaterials();
  const { user, isDemoMode } = useUser();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string>('');
  const [suggestedEvent, setSuggestedEvent] = useState<DetectedEvent | null>(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [pendingSuggestions, setPendingSuggestions] = useState<DetectedEvent[]>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FREE_DOCUMENTS = 10;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check if limit reached
    if (materials.length >= MAX_FREE_DOCUMENTS) {
      setShowLimitModal(true);
      return;
    }

    // Validate file type
    const validTypes = [
      'application/pdf', 
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/msword' // DOC (legacy)
    ];
    if (!validTypes.includes(file.type)) {
      alert('Only PDF, TXT, DOC, and DOCX files are supported');
      return;
    }

    // Show uploading state
    setUploadingFileName(file.name);
    setShowSuccessModal(true);

    // Process the document to extract text
    const processed = await processDocument(file);

    // Create new material with extracted content
    const newMaterial = {
      id: Date.now(),
      name: file.name,
      type: file.type === 'application/pdf' ? 'pdf' : 'txt',
      date: 'Just now',
      size: formatFileSize(file.size),
      file: file,
      content: processed.text,
      processed: processed.success,
      processingError: processed.error,
      usedOCR: processed.usedOCR,
    };

    addMaterial(newMaterial);
    setShowSuccessModal(false);
    setUploadingFileName('');

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Show error if processing failed
    if (!processed.success && processed.error) {
      alert(`Document uploaded, but text extraction failed: ${processed.error}. You can still chat about this document using general questions.`);
    }

    // Detect events from the text
    const detectedEvents = detectEventsFromText(processed.text);
    if (detectedEvents.length > 0) {
      setPendingSuggestions(detectedEvents);
      setCurrentSuggestionIndex(0);
      setSuggestedEvent(detectedEvents[0]);
      setShowSuggestModal(true);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 px-6 pt-12 pb-6 rounded-b-3xl relative">
        {onNavigate && (
          <div className="absolute top-12 left-6">
            <BackButton onBack={() => onNavigate('home')} />
          </div>
        )}
        <div className={onNavigate ? "pt-12" : ""}>
          <h1 className="text-2xl font-bold">Study Materials</h1>
          <p className="text-muted-foreground mt-1">{materials.length} / {MAX_FREE_DOCUMENTS} files (Free Plan)</p>
        </div>
      </div>

      {/* Upload Section */}
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
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
          className="hidden"
        />
      </div>

      {/* Materials List */}
      <div className="px-6 mt-6">
        <h2 className="font-semibold mb-3">All Materials</h2>
        <div className="space-y-3">
          {materials.map((material) => (
            <MaterialItem
              key={material.id}
              material={material}
              onDelete={() => deleteMaterial(material.id)}
            />
          ))}
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {}}
        title="Uploading..."
      >
        <div className="flex flex-col items-center py-6 gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Processing File</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {uploadingFileName}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Please wait...
            </p>
          </div>
        </div>
      </Modal>

      {/* Limit Reached Modal */}
      <Modal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Storage Limit Reached"
      >
        <div className="flex flex-col items-center py-6 gap-4">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
            <Upload className="w-10 h-10 text-accent-foreground" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Free Plan Limit</h3>
            <p className="text-sm text-muted-foreground mt-2">
              You've reached the maximum of {MAX_FREE_DOCUMENTS} documents on the free plan.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Delete some materials or upgrade to Pro for unlimited storage!
            </p>
          </div>
          <div className="w-full space-y-2 mt-2">
            <Button variant="primary" className="w-full">
              Upgrade to Pro
            </Button>
            <Button variant="secondary" onClick={() => setShowLimitModal(false)} className="w-full">
              Maybe Later
            </Button>
          </div>
        </div>
      </Modal>

      {/* Suggest Event Modal */}
      <AISuggestEventModal
        isOpen={showSuggestModal}
        suggestedEvent={suggestedEvent ? {
          ...suggestedEvent,
          source: uploadingFileName
        } : null}
        onAccept={async (event) => {
          if (!user) return;
          
          // Save event to calendar
          if (isDemoMode) {
            // In demo mode, just show success message
            alert(`Event "${event.title}" added to your calendar!`);
          } else {
            // Save to database
            try {
              const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/calendar/events`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${publicAnonKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    title: event.title,
                    date: event.date,
                    time: event.time,
                    type: event.type,
                    notes: event.notes,
                    location: event.location
                  })
                }
              );

              if (response.ok) {
                alert(`Event "${event.title}" added to your calendar!`);
              }
            } catch (error) {
              console.error('Error saving event:', error);
            }
          }

          // Show next suggestion if available
          if (currentSuggestionIndex < pendingSuggestions.length - 1) {
            setCurrentSuggestionIndex(currentSuggestionIndex + 1);
            setSuggestedEvent(pendingSuggestions[currentSuggestionIndex + 1]);
          } else {
            setShowSuggestModal(false);
          }
        }}
        onReject={() => {
          // Show next suggestion if available
          if (currentSuggestionIndex < pendingSuggestions.length - 1) {
            setCurrentSuggestionIndex(currentSuggestionIndex + 1);
            setSuggestedEvent(pendingSuggestions[currentSuggestionIndex + 1]);
          } else {
            setShowSuggestModal(false);
          }
        }}
      />
    </div>
  );
}

function MaterialItem({ 
  material, 
  onDelete 
}: { 
  material: any;
  onDelete: () => void;
}) {
  const getIcon = () => {
    switch (material.type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-primary" />;
      default:
        return <FileIcon className="w-6 h-6 text-accent" />;
    }
  };

  return (
    <Card className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{material.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{material.date} • {material.size}</span>
          {material.usedOCR && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              OCR
            </span>
          )}
          {material.processed && (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-10 h-10 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors flex-shrink-0"
      >
        <Trash2 className="w-5 h-5 text-destructive" />
      </button>
    </Card>
  );
}