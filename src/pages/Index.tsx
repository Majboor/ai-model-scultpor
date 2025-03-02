
import React, { useState } from 'react';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import ModelViewer from '@/components/ModelViewer';
import ModelGallery, { Model } from '@/components/ModelGallery';
import { saveModel, getSampleModels } from '@/utils/modelUtils';
import { useToast } from "@/hooks/use-toast";
import { generateCharacterImage, generateCharacterModel, ModelGenerationResponse } from '@/services/characterAPI';

const Index = () => {
  // State for API steps
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingModel, setIsGeneratingModel] = useState(false);
  const [characterName, setCharacterName] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [characterColor, setCharacterColor] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | undefined>(undefined);
  const [currentModel, setCurrentModel] = useState<string | undefined>(undefined);
  const [currentModelData, setCurrentModelData] = useState<ModelGenerationResponse | undefined>(undefined);
  const [models, setModels] = useState<Model[]>(getSampleModels());
  const { toast } = useToast();

  // Step 1: Generate character image
  const handleGenerateImage = async (name: string, description: string, color: string) => {
    setCharacterName(name);
    setCharacterDescription(description);
    setCharacterColor(color);
    setIsGeneratingImage(true);
    
    try {
      const imageData = await generateCharacterImage(name, description, color);
      setGeneratedImageUrl(imageData.image_url);
      
      toast({
        title: "Image generated successfully",
        description: "You can now create a 3D model or regenerate the image.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate image",
        description: "There was an error generating your character image. Please try again.",
        variant: "destructive",
      });
      console.error("Error generating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  // Step 2: Generate 3D model from the image
  const handleCreateModel = async () => {
    if (!generatedImageUrl) {
      toast({
        title: "No image available",
        description: "Please generate a character image first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingModel(true);
    
    try {
      const modelData = await generateCharacterModel(generatedImageUrl);
      setCurrentModelData(modelData);
      setCurrentModel(modelData.model_url);
      
      // Save the generated model to the user's collection
      const newModel = saveModel(characterName, generatedImageUrl, modelData);
      setModels([newModel, ...models]);
      
      toast({
        title: "Model generated successfully",
        description: "Your 3D model has been added to your gallery.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate model",
        description: "There was an error generating your 3D model. Please try again.",
        variant: "destructive",
      });
      console.error("Error generating model:", error);
    } finally {
      setIsGeneratingModel(false);
    }
  };
  
  // Handle regenerating the image
  const handleRegenerateImage = () => {
    // Reset image and model data
    setGeneratedImageUrl(undefined);
    setCurrentModel(undefined);
    setCurrentModelData(undefined);
    
    // Re-trigger image generation with the same parameters
    if (characterName && characterDescription && characterColor) {
      handleGenerateImage(characterName, characterDescription, characterColor);
    }
  };
  
  const handleSelectModel = (id: string) => {
    const model = models.find(m => m.id === id);
    if (model) {
      setCurrentModel(model.modelUrl);
      setGeneratedImageUrl(model.thumbnail);
      
      toast({
        title: model.name,
        description: "Model loaded successfully.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="page-container">
        <div className="grid grid-cols-1 gap-6">
          <PromptInput 
            onGenerate={handleGenerateImage} 
            isGenerating={isGeneratingImage || isGeneratingModel} 
          />
          
          <ModelViewer 
            modelUrl={currentModel} 
            imageUrl={generatedImageUrl}
            isLoading={false}
            isGeneratingImage={isGeneratingImage}
            isGeneratingModel={isGeneratingModel}
            onRegenerateImage={handleRegenerateImage}
            onCreateModel={handleCreateModel}
          />
          
          <ModelGallery 
            models={models} 
            onSelectModel={handleSelectModel} 
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
