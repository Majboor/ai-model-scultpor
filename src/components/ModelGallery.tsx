
import React from 'react';
import ModelCard from './ModelCard';
import { useToast } from "@/components/ui/use-toast";

export interface Model {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: Date;
}

interface ModelGalleryProps {
  models: Model[];
  onSelectModel: (id: string) => void;
}

const ModelGallery: React.FC<ModelGalleryProps> = ({ models, onSelectModel }) => {
  const { toast } = useToast();
  
  const handleDelete = (id: string) => {
    toast({
      title: "Model deleted",
      description: "The model has been deleted from your gallery.",
    });
    // In a real app, you would call an API to delete the model
  };
  
  const handleEdit = (id: string) => {
    toast({
      title: "Edit mode",
      description: "You can now edit your model.",
    });
    // In a real app, you would navigate to an edit page
  };
  
  if (models.length === 0) {
    return (
      <div className="mt-8 text-center py-12 glass-card rounded-2xl animate-fade-in">
        <h3 className="text-lg font-medium">Your gallery is empty</h3>
        <p className="text-muted-foreground mt-2">
          Generate some models to see them here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="mt-8 animate-fade-in">
      <h2 className="text-xl font-medium mb-4">Your Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            id={model.id}
            name={model.name}
            thumbnail={model.thumbnail}
            createdAt={model.createdAt}
            onSelect={onSelectModel}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default ModelGallery;
