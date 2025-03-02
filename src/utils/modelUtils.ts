
import { Model } from '@/components/ModelGallery';
import { ModelGenerationResponse } from '@/services/characterAPI';

// Save a 3D model to the user's collection
export const saveModel = (name: string, imageUrl: string, modelData: ModelGenerationResponse): Model => {
  // In a real app, this would be an API call to save the model
  return {
    id: Math.random().toString(36).substring(2, 9), // Generate a random ID
    name: name.length > 30 ? name.substring(0, 30) + '...' : name,
    thumbnail: imageUrl, // We use the character image as the thumbnail
    createdAt: new Date(),
    modelUrl: modelData.model_url,
    viewerUrl: modelData.viewer_url
  };
};

// Sample model data for demonstration
export const getSampleModels = (): Model[] => {
  return [
    {
      id: '1',
      name: 'Modern Chair',
      thumbnail: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fDNkJTIwbW9kZWx8ZW58MHx8MHx8fDA%3D',
      createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
    {
      id: '2',
      name: 'Sports Car',
      thumbnail: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fDNkJTIwbW9kZWx8ZW58MHx8MHx8fDA%3D',
      createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
    },
    {
      id: '3',
      name: 'Abstract Sculpture',
      thumbnail: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8M2QlMjBwcmludHxlbnwwfHwwfHx8MA%3D%3D',
      createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
    },
  ];
};
