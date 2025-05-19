
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, FileDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SignatureCanvasProps {
  onSignatureCapture: (signatureDataUrl: string) => void;
  width?: number;
  height?: number;
  initialSignature?: string;
  label?: string;
}

export function SignatureCanvas({
  onSignatureCapture,
  width = 300,
  height = 150,
  initialSignature,
  label = "Signature"
}: SignatureCanvasProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  
  // Set up canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set canvas properties
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = '#000000';
    
    // Clear canvas and set background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Load initial signature if provided
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);
  
  const getRelativePosition = (
    e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent, 
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };
  
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    setDrawing(true);
    setHasSignature(true);
    
    const pos = getRelativePosition(e, canvas);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
    context.lineTo(pos.x, pos.y); // Draw a dot
    context.stroke();
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const pos = getRelativePosition(e, canvas);
    context.lineTo(pos.x, pos.y);
    context.stroke();
  };
  
  const endDrawing = () => {
    setDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureDataUrl = canvas.toDataURL('image/png');
    onSignatureCapture(signatureDataUrl);
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureCapture('');
  };
  
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureDataUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = signatureDataUrl;
    downloadLink.download = 'signature.png';
    downloadLink.click();
  };
  
  // Set up mouse event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleMouseUp = () => {
      if (drawing) {
        endDrawing();
      }
    };
    
    const handleMouseLeave = () => {
      if (drawing) {
        endDrawing();
      }
    };
    
    // Add document-level event listeners
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [drawing]);
  
  // Add touch event handlers for mobile support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleTouchEnd = () => {
      if (drawing) {
        endDrawing();
      }
    };
    
    canvas.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [drawing]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <Card className="border border-gray-300">
        <CardContent className="pt-6">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="border border-gray-300 rounded cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchMove={draw}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-between mt-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={clearSignature}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('common.clear')}
        </Button>
        
        <div className="flex gap-2">
          {hasSignature && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={saveSignature}
            >
              <FileDown className="mr-2 h-4 w-4" />
              {t('common.download')}
            </Button>
          )}
          
          {hasSignature && (
            <Button 
              type="button" 
              size="sm" 
              onClick={() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                onSignatureCapture(canvas.toDataURL('image/png'));
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              {t('common.confirm')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
