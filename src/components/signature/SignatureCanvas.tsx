
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignatureCanvasProps {
  width?: number;
  height?: number;
  lineWidth?: number;
  lineColor?: string;
  className?: string;
  onChange?: (signature: string | null) => void;
  value?: string;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  width = 300,
  height = 150,
  lineWidth = 2,
  lineColor = "#000000",
  className,
  onChange,
  value
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Si une valeur initiale est fournie, l'afficher
  useEffect(() => {
    if (value && canvasRef.current) {
      const image = new Image();
      image.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0);
            setHasSignature(true);
          }
        }
      };
      image.src = value;
    }
  }, [value]);

  // Initialiser le canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Ajuster la taille du canvas pour la netteté
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = lineColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [width, height, lineWidth, lineColor]);

  // Gestion du dessin
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    
    // Obtenir les coordonnées
    const rect = canvas.getBoundingClientRect();
    const x = getClientX(e) - rect.left;
    const y = getClientY(e) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Obtenir les coordonnées
    const rect = canvas.getBoundingClientRect();
    const x = getClientX(e) - rect.left;
    const y = getClientY(e) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.closePath();
      setIsDrawing(false);
      
      // Informer le parent du changement
      if (onChange) {
        onChange(hasSignature ? canvas.toDataURL() : null);
      }
    }
  };

  // Fonctions utilitaires pour gérer les événements tactiles et souris
  const getClientX = (e: React.MouseEvent | React.TouchEvent): number => {
    if ('touches' in e) {
      return e.touches[0].clientX;
    }
    return e.clientX;
  };

  const getClientY = (e: React.MouseEvent | React.TouchEvent): number => {
    if ('touches' in e) {
      return e.touches[0].clientY;
    }
    return e.clientY;
  };

  // Effacer la signature
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    
    if (onChange) {
      onChange(null);
    }
  };

  // Enregistrer la signature
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    if (onChange) {
      onChange(canvas.toDataURL());
    }
  };

  return (
    <div className="space-y-2">
      <div className={cn("border rounded-md bg-background", className)}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="touch-none cursor-crosshair"
          style={{ width, height }}
        />
      </div>
      
      <div className="flex justify-between gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={clearSignature}
          disabled={!hasSignature}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Effacer
        </Button>
        
        <Button 
          type="button" 
          size="sm" 
          onClick={saveSignature}
          disabled={!hasSignature}
        >
          <Check className="h-4 w-4 mr-1" /> Valider
        </Button>
      </div>
    </div>
  );
};
