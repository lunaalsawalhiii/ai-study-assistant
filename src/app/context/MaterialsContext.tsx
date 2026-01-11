import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser } from './UserContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface UploadedMaterial {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
  file?: File;
  content?: string; // Extracted text content
  processed?: boolean; // Whether the document has been processed
  processingError?: string; // Error message if processing failed
  usedOCR?: boolean; // Whether OCR was used to extract text
}

interface MaterialsContextType {
  materials: UploadedMaterial[];
  setMaterials: (materials: UploadedMaterial[]) => void;
  addMaterial: (material: UploadedMaterial) => void;
  deleteMaterial: (id: number) => void;
  isLoading: boolean;
}

const MaterialsContext = createContext<MaterialsContextType | undefined>(undefined);

export function MaterialsProvider({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useUser();
  const [materials, setMaterialsState] = useState<UploadedMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load materials when user changes
  useEffect(() => {
    loadMaterials();
  }, [user, isDemoMode]);

  const loadMaterials = async () => {
    setIsLoading(true);
    
    if (isDemoMode) {
      // Demo mode: Use demo-specific localStorage
      const savedMaterials = localStorage.getItem('lunarMaterials_demo');
      if (savedMaterials) {
        setMaterialsState(JSON.parse(savedMaterials));
      } else {
        // Default demo materials
        setMaterialsState([
          { 
            id: 1, 
            name: 'Chapter 5: Calculus Basics.pdf', 
            type: 'pdf', 
            date: 'Today', 
            size: '2.4 MB',
            content: 'Demo calculus content for testing...',
            processed: true
          },
          { 
            id: 2, 
            name: 'The French Revolution.pdf', 
            type: 'pdf', 
            date: 'Yesterday', 
            size: '1.8 MB',
            content: 'Demo history content for testing...',
            processed: true
          },
          { 
            id: 3, 
            name: 'Photosynthesis Notes.pdf', 
            type: 'pdf', 
            date: '2 days ago', 
            size: '3.1 MB',
            content: 'Demo biology content for testing...',
            processed: true
          },
          { 
            id: 4, 
            name: 'Chemistry Formulas.txt', 
            type: 'txt', 
            date: '3 days ago', 
            size: '856 KB',
            content: 'Demo chemistry formulas for testing...',
            processed: true
          },
        ]);
      }
    } else if (user) {
      // Real user: Load from database
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/materials`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMaterialsState(data.materials || []);
        } else {
          console.error('Failed to load materials');
          setMaterialsState([]);
        }
      } catch (error) {
        console.error('Error loading materials:', error);
        setMaterialsState([]);
      }
    } else {
      // No user logged in
      setMaterialsState([]);
    }
    
    setIsLoading(false);
  };

  // Save materials whenever they change
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load
    
    if (isDemoMode) {
      // Demo mode: Save to demo-specific localStorage
      const materialsToSave = materials.map(({ file, ...rest }) => rest);
      localStorage.setItem('lunarMaterials_demo', JSON.stringify(materialsToSave));
    } else if (user) {
      // Real user: Save to database
      saveMaterialsToDatabase();
    }
  }, [materials, isDemoMode, user]);

  const saveMaterialsToDatabase = async () => {
    if (!user) return;
    
    try {
      const materialsToSave = materials.map(({ file, ...rest }) => rest);
      
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12045ef3/materials`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ materials: materialsToSave })
        }
      );
    } catch (error) {
      console.error('Error saving materials to database:', error);
    }
  };

  const setMaterials = (newMaterials: UploadedMaterial[]) => {
    setMaterialsState(newMaterials);
  };

  const addMaterial = (material: UploadedMaterial) => {
    setMaterialsState(prev => [material, ...prev]);
  };

  const deleteMaterial = (id: number) => {
    setMaterialsState(prev => prev.filter(m => m.id !== id));
  };

  return (
    <MaterialsContext.Provider value={{ materials, setMaterials, addMaterial, deleteMaterial, isLoading }}>
      {children}
    </MaterialsContext.Provider>
  );
}

export function useMaterials() {
  const context = useContext(MaterialsContext);
  if (context === undefined) {
    throw new Error('useMaterials must be used within a MaterialsProvider');
  }
  return context;
}