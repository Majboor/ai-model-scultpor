
import React, { useEffect, useRef, useState } from 'react';
import ModelControls from './ModelControls';
import { useToast } from "@/hooks/use-toast";
import { Button } from './ui/button';
import { RefreshCcw, Cuboid, ExternalLink } from 'lucide-react';
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
      description: (
        <div className="mt-1">
          <span className="text-sm block mb-1">Your model will be downloaded as a .glb file.</span>
          <a 
            href={secureModelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center text-xs truncate"
          >
            {secureModelUrl} <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
          </a>
        </div>
      ),
    });
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = secureModelUrl || '';
    link.download = 'character_model.glb';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Loading state with improved visual hierarchy
  if (isLoading || isGeneratingImage || isGeneratingModel) {
    return (
      <div className="relative w-full h-[400px] sm:h-[500px] rounded-xl overflow-hidden animate-fade-in bg-gradient-to-b from-background to-secondary/30">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/20 backdrop-blur-sm">
          <div className="relative">
            <div className="h-16 w-16 rounded-xl border-4 border-primary border-t-transparent animate-spin"></div>
            <div className="absolute -inset-1 rounded-xl bg-primary/10 blur-md animate-pulse-subtle"></div>
          </div>
          <p className="mt-6 text-sm font-medium text-foreground">
            {isGeneratingImage ? "Generating your character image..." : 
             isGeneratingModel ? "Creating your 3D model..." : 
             "Generating your model..."}
          </p>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs text-center">
            {isGeneratingImage ? "This might take 10-15 seconds" : 
             isGeneratingModel ? "This process usually takes 3-5 minutes. Feel free to wait or come back later." : 
             "This might take a minute"}
          </p>
        </div>
      </div>
    );
  }
  
  // Empty state with minimal, focused design
  if (!imageUrl && !modelUrl) {
    return (
      <div className="relative w-full h-[400px] sm:h-[500px] rounded-xl overflow-hidden animate-fade-in">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-secondary/40 to-background">
          <div className="relative h-28 w-28">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-400/10 rounded-full animate-pulse-subtle"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-primary/20 to-blue-400/20 rounded-full animate-float"></div>
            <div className="absolute inset-8 bg-gradient-to-br from-primary/30 to-blue-400/30 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-12 bg-gradient-to-br from-primary to-blue-400 rounded-full"></div>
          </div>
          <p className="mt-8 text-sm font-medium">Create Your Character</p>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs text-center">
            Use the prompt input above to describe and generate your character
          </p>
        </div>
      </div>
    );
  }
  
  // Image-only state with cleaner layout
  if (imageUrl && !modelUrl) {
    return (
      <div className="relative w-full h-[400px] sm:h-[500px] rounded-xl overflow-hidden animate-fade-in">
        <div className="w-full h-full bg-gradient-to-b from-background/80 to-secondary/30 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-400/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img 
                src={ensureHttps(imageUrl)} 
                alt="Generated Character" 
                className="relative max-w-full max-h-[320px] object-contain rounded-lg shadow-md" 
              />
            </div>
          </div>
          <div className="p-4 flex justify-between items-center bg-background/50 backdrop-blur-sm border-t border-border/40">
            <Button 
              variant="outline" 
              onClick={onRegenerateImage}
              className="glass-button"
              disabled={!onRegenerateImage}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Regenerate
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
  
  // 3D model viewer with improved layout and interaction hints
  return (
    <div className="relative w-full h-[400px] sm:h-[500px] rounded-xl overflow-hidden animate-fade-in">
      {viewerUrl ? (
        <div className="w-full h-full relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/5 pointer-events-none z-10"></div>
          <iframe 
            src={ensureHttps(viewerUrl)} 
            className="w-full h-full border-none bg-gradient-to-b from-secondary/20 to-background/20" 
            title="3D Model Viewer"
            allow="accelerometer; autoplay; camera; fullscreen; gyroscope; magnetometer"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
          {isMobile && (
            <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 z-20 shadow-sm border border-border/30">
              <p className="text-xs text-foreground flex items-center">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
                Tap and drag to rotate model
              </p>
            </div>
          )}
        </div>
      ) : (
        <div ref={canvasRef} className="model-canvas w-full h-full flex items-center justify-center bg-gradient-to-b from-secondary/40 to-background/40">
          {modelUrl ? (
            <div className="flex flex-col items-center justify-center space-y-3 max-w-xs text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Cuboid className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Model Available</p>
              <p className="text-xs text-muted-foreground">The model is ready but no viewer is available</p>
              <Button variant="outline" onClick={handleDownload} className="mt-2">
                Download Model
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 max-w-xs text-center">
              <p className="text-muted-foreground text-sm">No model viewer available</p>
              <p className="text-xs text-muted-foreground">Try generating a new model</p>
            </div>
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
