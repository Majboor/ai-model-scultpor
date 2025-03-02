
import React, { useEffect, useRef, useState } from 'react';
import ModelControls from './ModelControls';
import { useToast } from "@/hooks/use-toast";
import { Button } from './ui/button';
import { RefreshCcw, Cuboid } from 'lucide-react';

interface ModelViewerProps {
  modelUrl?: string;
  imageUrl?: string;
  isLoading: boolean;
  isGeneratingImage: boolean;
  isGeneratingModel: boolean;
  onRegenerateImage?: () => void;
  onCreateModel?: () => void;
  viewerUrl?: string; // Add viewer URL prop
}

// Helper function to ensure URLs use HTTPS
const ensureHttps = (url?: string): string | undefined => {
  if (!url) return undefined;
  return url.replace('http://', 'https://');
};

const ModelViewer: React.FC<ModelViewerProps> = ({ 
  modelUrl, 
  imageUrl, 
  isLoading, 
  isGeneratingImage,
  isGeneratingModel,
  onRegenerateImage,
  onCreateModel,
  viewerUrl
}) => {
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
  
  if (isLoading || isGeneratingImage || isGeneratingModel) {
    return (
      <div className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden animate-fade-in">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/50 backdrop-blur-sm">
          <div className="h-16 w-16 rounded-xl border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-sm font-medium">
            {isGeneratingImage ? "Generating your character image..." : 
             isGeneratingModel ? "Creating your 3D model (3-5 minutes)..." : 
             "Generating your model..."}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {isGeneratingImage ? "This might take 10-15 seconds" : 
             isGeneratingModel ? "Please be patient while we create your model" : 
             "This might take a minute"}
          </p>
        </div>
      </div>
    );
  }
  
  if (!imageUrl && !modelUrl) {
    return (
      <div className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden animate-fade-in">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-secondary/80 to-background">
          <div className="relative h-32 w-32">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-400/20 rounded-full animate-pulse-subtle"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-primary/30 to-blue-400/30 rounded-full animate-float"></div>
            <div className="absolute inset-8 bg-gradient-to-br from-primary/40 to-blue-400/40 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-12 bg-gradient-to-br from-primary to-blue-400 rounded-full"></div>
          </div>
          <p className="mt-8 text-sm font-medium">Ready to create</p>
          <p className="text-xs text-muted-foreground mt-2">Use the prompt input above to generate a character</p>
        </div>
      </div>
    );
  }
  
  if (imageUrl && !modelUrl) {
    return (
      <div className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden animate-fade-in">
        <div className="w-full h-full bg-gray-100 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <div className="max-h-full w-auto flex items-center justify-center">
              <img 
                src={ensureHttps(imageUrl)} 
                alt="Generated Character" 
                className="max-w-full max-h-[320px] object-contain shadow-md rounded-lg" 
              />
            </div>
          </div>
          <div className="p-4 flex justify-between bg-secondary/10 backdrop-blur-sm">
            <Button 
              variant="outline" 
              onClick={onRegenerateImage}
              className="glass-button"
              disabled={!onRegenerateImage}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Regenerate Image
            </Button>
            <Button 
              onClick={onCreateModel}
              className="bg-primary text-white hover:bg-primary/90"
              disabled={!onCreateModel}
            >
              <Cuboid className="h-4 w-4 mr-2" />
              Create 3D Model
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Use the iframe for the 3D model viewer when viewerUrl is available
  return (
    <div className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden animate-fade-in">
      {viewerUrl ? (
        <iframe 
          src={ensureHttps(viewerUrl)} 
          className="w-full h-full border-none" 
          title="3D Model Viewer"
          allow="accelerometer; autoplay; camera; fullscreen; gyroscope; magnetometer"
          loading="lazy"
        ></iframe>
      ) : (
        <div ref={canvasRef} className="model-canvas w-full h-full">
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">No model viewer URL available</p>
          </div>
        </div>
      )}
      
      <ModelControls
        onRotate={handleRotate}
        onZoomChange={handleZoomChange}
        zoomLevel={zoomLevel}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default ModelViewer;
