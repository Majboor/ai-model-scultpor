
import React from 'react';
import ModelCard from './ModelCard';

export interface Model {
  id: string;
  name: string;
  thumbnail: string;
  modelUrl: string;
  viewerUrl?: string;
  createdAt: Date;
}

interface ModelGalleryProps {
  models: Model[];
  onSelectModel: (id: string) => void;
  onDeleteModel?: (id: string) => void;
  onEditModel?: (id: string) => void;
}

const ModelGallery: React.FC<ModelGalleryProps> = ({ 
  models, 
  onSelectModel,
  onDeleteModel,
  onEditModel
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Your Collection</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            onSelect={() => onSelectModel(model.id)}
            onDelete={onDeleteModel}
            onEdit={onEditModel}
          />
        ))}
      </div>
    </div>
  );
};

export default ModelGallery;
