
import React, { useEffect, useRef, useState } from 'react';
import ModelControls from './ModelControls';
import { useToast } from "@/components/ui/use-toast";

interface ModelViewerProps {
  modelUrl?: string;
  isLoading: boolean;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ modelUrl, isLoading }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { toast } = useToast();
  
  const handleZoomChange = (value: number) => {
    setZoomLevel(value);
    // In a real app, you would update the 3D camera zoom
  };
  
  const handleRotate = () => {
    // In a real app, you would trigger a rotation animation
    toast({
      title: "Auto-rotating model",
      description: "The model will rotate automatically for 5 seconds.",
    });
  };
  
  const handleDownload = () => {
    toast({
      title: "Downloading model",
      description: "Your model will be downloaded as a .glb file.",
    });
    // In a real app, you would download the model
  };
  
  return (
    <div className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden animate-fade-in">
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/50 backdrop-blur-sm">
          <div className="h-16 w-16 rounded-xl border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-sm font-medium">Generating your model...</p>
          <p className="text-xs text-muted-foreground mt-2">This might take a minute</p>
        </div>
      ) : !modelUrl ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-secondary/80 to-background">
          <div className="relative h-32 w-32">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-400/20 rounded-full animate-pulse-subtle"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-primary/30 to-blue-400/30 rounded-full animate-float"></div>
            <div className="absolute inset-8 bg-gradient-to-br from-primary/40 to-blue-400/40 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-12 bg-gradient-to-br from-primary to-blue-400 rounded-full"></div>
          </div>
          <p className="mt-8 text-sm font-medium">Ready to create</p>
          <p className="text-xs text-muted-foreground mt-2">Use the prompt input above to generate a model</p>
        </div>
      ) : (
        <div ref={canvasRef} className="model-canvas">
          {/* In a real app, this is where you would render the 3D model */}
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src={modelUrl} 
              alt="3D Model Preview" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
      
      {(modelUrl && !isLoading) && (
        <ModelControls
          onRotate={handleRotate}
          onZoomChange={handleZoomChange}
          zoomLevel={zoomLevel}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default ModelViewer;
