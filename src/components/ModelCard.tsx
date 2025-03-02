
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Download, Trash, Edit
} from "lucide-react";

interface ModelCardProps {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: Date;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({
  id,
  name,
  thumbnail,
  createdAt,
  onSelect,
  onDelete,
  onEdit
}) => {
  return (
    <div 
      className="glass-card rounded-xl overflow-hidden clickable cursor-pointer animate-scale-in"
      onClick={() => onSelect(id)}
    >
      <div className="relative h-40 w-full bg-secondary rounded-t-xl overflow-hidden">
        <img
          src={thumbnail}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
          <div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-white/80"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-white/80"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-sm truncate">{name}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {createdAt.toLocaleDateString()}
        </p>
        
        <div className="mt-3 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs py-1 h-7"
            onClick={(e) => {
              e.stopPropagation();
              // Download logic
            }}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
