
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Download, Trash, Edit, ExternalLink
} from "lucide-react";
import { Model } from './ModelGallery';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface ModelCardProps {
  model: Model;
  onSelect: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onSelect,
  onDelete,
  onEdit
}) => {
  const { toast } = useToast();

  // Ensure model URL uses HTTPS
  const secureModelUrl = model.modelUrl ? model.modelUrl.replace('http://', 'https://') : '';

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Show toast with link
    toast({
      title: "Download Started",
      description: (
        <div className="mt-2">
          <p className="mb-2">Model URL:</p>
          <a 
            href={secureModelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center text-xs break-all"
          >
            {secureModelUrl} <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      ),
    });

    // Start download
    const link = document.createElement('a');
    link.href = secureModelUrl;
    link.setAttribute('download', `${model.name}.glb`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="glass-card rounded-xl overflow-hidden clickable cursor-pointer animate-scale-in"
      onClick={onSelect}
    >
      <div className="relative h-40 w-full bg-secondary rounded-t-xl overflow-hidden">
        <img
          src={model.thumbnail}
          alt={model.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
          {onEdit && (
            <div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/80"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(model.id);
                }}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          {onDelete && (
            <div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/80"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(model.id);
                }}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-sm truncate">{model.name}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {model.createdAt.toLocaleDateString()}
        </p>
        
        <div className="mt-3 flex justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs py-1 h-7"
                  onClick={handleDownload}
                  disabled={!model.modelUrl}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download 3D Model</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
