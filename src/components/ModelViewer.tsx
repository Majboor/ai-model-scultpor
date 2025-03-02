
import React, { useEffect, useRef, useState } from 'react';
import ModelControls from './ModelControls';
import { useToast } from "@/hooks/use-toast";
import { Button } from './ui/button';
import { RefreshCcw, Cuboid } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ModelViewerProps {
  modelUrl?: string;
  imageUrl?: string;
  isLoading: boolean;
  isGeneratingImage: boolean;
  isGeneratingModel: boolean;
  onRegenerateImage?: () => void;
  onCreateModel?: () => void;
  viewerUrl?: string;
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
  const isMobile = useIsMobile();
  
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
    if (!modelUrl) return;

    const secureModelUrl = ensureHttps(modelUrl);
    
    toast({
      title: "Downloading model",
      description: `Model URL: ${secureModelUrl}`,
    });
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = secureModelUrl || '';
    link.download = 'character_model.glb';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="w-full h-full relative">
          <iframe 
            src={ensureHttps(viewerUrl)} 
            className="w-full h-full border-none" 
            title="3D Model Viewer"
            allow="accelerometer; autoplay; camera; fullscreen; gyroscope; magnetometer"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
          {isMobile && (
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md p-1">
              <p className="text-xs text-foreground">Tap and drag to rotate model</p>
            </div>
          )}
        </div>
      ) : (
        <div ref={canvasRef} className="model-canvas w-full h-full flex items-center justify-center">
          {modelUrl ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <p className="text-muted-foreground">Model available but no viewer URL provided</p>
              <Button variant="outline" onClick={handleDownload}>Download Model</Button>
            </div>
          ) : (
            <p className="text-muted-foreground">No model viewer URL available</p>
          )}
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
