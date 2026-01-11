import React from 'react';
import { Button } from './Button';
import { LogOut } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in duration-300">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-destructive" />
          </div>

          {/* Title */}
          <h3 className="font-bold text-xl mb-2">Log Out?</h3>
          
          {/* Message */}
          <p className="text-muted-foreground mb-6">
            Are you sure you want to log out? You'll need to sign in again to access your study materials.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onConfirm}
              variant="primary"
              fullWidth
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, Log Out
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
