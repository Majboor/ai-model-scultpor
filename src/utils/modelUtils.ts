
import { ModelGenerationResponse } from '@/services/characterAPI';
import { v4 as uuidv4 } from 'uuid';
import { Model } from '@/components/ModelGallery';

// Helper function to ensure URLs use HTTPS
export const ensureHttps = (url: string): string => {
  return url.replace('http://', 'https://');
};

// Save a generated model to the user's collection
export const saveModel = (
  name: string,
  imageUrl: string,
  modelData: ModelGenerationResponse
): Model => {
  const newModel: Model = {
    id: uuidv4(),
    name: name || 'Unnamed Character',
    thumbnail: ensureHttps(imageUrl),
    modelUrl: ensureHttps(modelData.model_url),
    viewerUrl: ensureHttps(modelData.viewer_url), // Store the viewer URL
    createdAt: new Date(),
  };

  // In a real app, you would save this to a database or local storage
  return newModel;
};

// Get sample models for demonstration purposes
export const getSampleModels = (): Model[] => {
  return [
    {
      id: '1',
      name: 'Robo Fighter',
      thumbnail: 'https://i.ibb.co/nj8Yy08/robot-character.png',
      modelUrl: 'https://i.ibb.co/nj8Yy08/robot-character.png',
      viewerUrl: 'https://model-viewer.glitch.me/',
      createdAt: new Date('2023-05-15'),
    },
    {
      id: '2',
      name: 'Fantasy Wizard',
      thumbnail: 'https://i.ibb.co/Qvs67Gd/wizard-character.png',
      modelUrl: 'https://i.ibb.co/Qvs67Gd/wizard-character.png',
      viewerUrl: 'https://model-viewer.glitch.me/',
      createdAt: new Date('2023-05-10'),
    },
    {
      id: '3',
      name: 'Space Explorer',
      thumbnail: 'https://i.ibb.co/G3jr2V4/astronaut-character.png',
      modelUrl: 'https://i.ibb.co/G3jr2V4/astronaut-character.png',
      viewerUrl: 'https://model-viewer.glitch.me/',
      createdAt: new Date('2023-05-05'),
    },
  ];
};
