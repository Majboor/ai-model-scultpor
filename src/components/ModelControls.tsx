
import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  RotateCw, ZoomIn, Download, Share2, Layers
} from "lucide-react";

interface ModelControlsProps {
  onRotate: () => void;
  onZoomChange: (value: number) => void;
  zoomLevel: number;
  onDownload: () => void;
}

const ModelControls: React.FC<ModelControlsProps> = ({
  onRotate,
  onZoomChange,
  zoomLevel,
  onDownload
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 glass-card rounded-full px-5 py-3 flex items-center gap-6 animate-fade-in z-10">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-9 w-9 bg-white bg-opacity-60"
        onClick={onRotate}
      >
        <RotateCw className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-3">
        <ZoomIn className="h-4 w-4" />
        <Slider
          value={[zoomLevel]}
          min={0.5}
          max={3}
          step={0.1}
          onValueChange={(value) => onZoomChange(value[0])}
          className="w-24"
        />
      </div>
      
      <div className="h-8 w-px bg-border mx-1"></div>
      
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-9 w-9 bg-white bg-opacity-60"
      >
        <Layers className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-9 w-9 bg-white bg-opacity-60"
        onClick={onDownload}
      >
        <Download className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-9 w-9 bg-white bg-opacity-60"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ModelControls;
